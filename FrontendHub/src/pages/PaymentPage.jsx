// src/pages/PaymentPage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Card,
  Button,
  Spinner,
  ProgressBar,
  Form,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { orderApi } from "../api/orderApi";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { discountCodeApi } from "../api/discountCodeApi";

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { reloadCart } = useCart();

  // ✅ lấy state từ navigate hoặc sessionStorage (để refresh không mất)
  const [stateData, setStateData] = useState(null);

  const [secondsLeft, setSecondsLeft] = useState(60);
  const [paying, setPaying] = useState(false);

  // shipping
  const [shippingMethod, setShippingMethod] = useState("FAST");

  // base pricing
  const [itemsTotal, setItemsTotal] = useState(0);

  // public codes
  const [publicOrderCodes, setPublicOrderCodes] = useState([]);
  const [publicShipCodes, setPublicShipCodes] = useState([]);

  // order coupon
  const [selectedOrderPublic, setSelectedOrderPublic] = useState("");
  const [orderInputCode, setOrderInputCode] = useState("");
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [orderCodeError, setOrderCodeError] = useState("");

  // ship coupon
  const [selectedShipPublic, setSelectedShipPublic] = useState("");
  const [shipInputCode, setShipInputCode] = useState("");
  const [shipDiscount, setShipDiscount] = useState(0);
  const [shipCodeError, setShipCodeError] = useState("");

  const normalize = (s) => (s || "").trim().toUpperCase();

  const checkoutData = stateData?.checkoutData || null;

  // shipping fee from method
  const shippingFee = useMemo(() => {
    return shippingMethod === "SUPER_FAST" ? 30000 : 20000;
  }, [shippingMethod]);

  const checkDiscount = async (code) => {
    const fn = discountCodeApi.checkCode || discountCodeApi.check;
    return fn(code);
  };

  // ✅ tính discount preview gần giống backend
  const calcDiscountPreview = (dc, baseAmount) => {
    const base = Number(baseAmount) || 0;
    if (!dc || base <= 0) return 0;

    const type = dc.type; // "PERCENT" | "FIXED_AMOUNT"
    const value = Number(dc.value) || 0;
    const maxDiscount = dc.maxDiscount != null ? Number(dc.maxDiscount) : null;

    let discount = 0;
    if (type === "PERCENT") discount = Math.round(base * (value / 100));
    else discount = value;

    if (maxDiscount != null && discount > maxDiscount) discount = maxDiscount;
    if (discount > base) discount = base;
    if (discount < 0) discount = 0;

    return discount;
  };

  const grandTotal = useMemo(() => {
    const original = Number(itemsTotal || 0) + Number(shippingFee || 0);
    const discountTotal = Number(orderDiscount || 0) + Number(shipDiscount || 0);
    return Math.max(0, original - discountTotal);
  }, [itemsTotal, shippingFee, orderDiscount, shipDiscount]);

  // ===== init state =====
  useEffect(() => {
    const fromNav = location.state;
    let fromStorage = null;

    try {
      fromStorage = JSON.parse(sessionStorage.getItem("checkout_state") || "null");
    } catch {
      fromStorage = null;
    }

    const s = fromNav?.checkoutData ? fromNav : fromStorage;

    if (!s?.checkoutData) {
      navigate("/cart");
      return;
    }

    setStateData(s);

    // init shipping + pricing
    setShippingMethod(s.checkoutData.shippingMethod || "FAST");
    setItemsTotal(Number(s.pricing?.itemsTotal ?? 0));

    // init codes (prefill)
    const c1 = normalize(s.codes?.couponCode || s.checkoutData.couponCode || "");
    const c2 = normalize(s.codes?.shippingCouponCode || s.checkoutData.shippingCouponCode || "");

    setSelectedOrderPublic(c1);
    setOrderInputCode(c1);

    setSelectedShipPublic(c2);
    setShipInputCode(c2);

    // init discounts from checkout (nếu có)
    setOrderDiscount(Number(s.pricing?.orderDiscount ?? 0));
    setShipDiscount(Number(s.pricing?.shipDiscount ?? 0));
  }, [location.state, navigate]);

  // load public codes
  useEffect(() => {
    const loadPublic = async () => {
      try {
        const allPublic = await discountCodeApi.getPublic();
        const orderCodes =
          (allPublic || []).filter(
            (x) => x.scope === "ORDER_TOTAL" || x.scope === "BOTH"
          ) || [];
        const shipCodes =
          (allPublic || []).filter(
            (x) => x.scope === "SHIPPING_FEE" || x.scope === "BOTH"
          ) || [];
        setPublicOrderCodes(orderCodes);
        setPublicShipCodes(shipCodes);
      } catch (e) {
        console.error("Không thể load mã công khai", e);
      }
    };
    loadPublic();
  }, []);

  // persist every change (để refresh không mất)
  const persistState = (patch) => {
    const current = stateData || {};
    const next = {
      ...current,
      ...patch,
      checkoutData: patch?.checkoutData ? patch.checkoutData : current.checkoutData,
      pricing: {
        ...(current.pricing || {}),
        ...(patch?.pricing || {}),
      },
      codes: {
        ...(current.codes || {}),
        ...(patch?.codes || {}),
      },
    };
    setStateData(next);
    sessionStorage.setItem("checkout_state", JSON.stringify(next));
  };

  // ===== validate =====
  const validateOrderCode = async (code) => {
    setOrderCodeError("");
    const c = normalize(code);
    if (!c) {
      setOrderDiscount(0);
      persistState({ codes: { couponCode: null }, pricing: { orderDiscount: 0 } });
      return;
    }
    try {
      const dc = await checkDiscount(c);
      if (!(dc.scope === "ORDER_TOTAL" || dc.scope === "BOTH")) {
        throw { response: { data: { message: "Mã này không áp dụng cho tiền hàng." } } };
      }
      const d = calcDiscountPreview(dc, itemsTotal);
      setOrderDiscount(d);
      persistState({ codes: { couponCode: c }, pricing: { orderDiscount: d } });
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        "Mã giảm giá không hợp lệ";
      setOrderDiscount(0);
      setOrderCodeError(msg);
      persistState({ codes: { couponCode: null }, pricing: { orderDiscount: 0 } });
    }
  };

  const validateShipCode = async (code) => {
    setShipCodeError("");
    const c = normalize(code);
    if (!c) {
      setShipDiscount(0);
      persistState({ codes: { shippingCouponCode: null }, pricing: { shipDiscount: 0 } });
      return;
    }
    try {
      const dc = await checkDiscount(c);
      if (!(dc.scope === "SHIPPING_FEE" || dc.scope === "BOTH")) {
        throw { response: { data: { message: "Mã này không áp dụng cho phí vận chuyển." } } };
      }
      const d = calcDiscountPreview(dc, shippingFee);
      setShipDiscount(d);
      persistState({ codes: { shippingCouponCode: c }, pricing: { shipDiscount: d } });
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        "Mã vận chuyển không hợp lệ";
      setShipDiscount(0);
      setShipCodeError(msg);
      persistState({ codes: { shippingCouponCode: null }, pricing: { shipDiscount: 0 } });
    }
  };

  // đổi shipping => revalidate ship code nếu đang có code
  useEffect(() => {
    const activeCode = normalize(selectedShipPublic) || normalize(shipInputCode);
    if (activeCode) validateShipCode(activeCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingFee]);

  // ===== TIMER =====
  useEffect(() => {
    if (!checkoutData) return;
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, checkoutData]);

  const expired = secondsLeft <= 0;

  useEffect(() => {
    if (!expired) return;
    const t = setTimeout(() => navigate("/cart"), 3000);
    return () => clearTimeout(t);
  }, [expired, navigate]);

  if (!checkoutData) return null;

  const methodLabel =
    checkoutData.paymentMethod === "MOMO"
      ? "Ví Momo"
      : checkoutData.paymentMethod === "VNPAY"
      ? "VNPay"
      : checkoutData.paymentMethod;

  const handleConfirmPaid = async () => {
    if (orderCodeError || shipCodeError) {
      showToast("Vui lòng kiểm tra lại mã giảm giá");
      return;
    }

    try {
      setPaying(true);

      const couponCode =
        normalize(selectedOrderPublic) || normalize(orderInputCode) || null;
      const shippingCouponCode =
        normalize(selectedShipPublic) || normalize(shipInputCode) || null;

      const payload = {
        ...checkoutData,
        shippingMethod,
        couponCode,
        shippingCouponCode,
      };

      const order = await orderApi.createOrder(payload);

      sessionStorage.removeItem("checkout_state");
      showToast(`Thanh toán ${methodLabel} thành công! Đơn #${order.id}`);
      navigate("/orders");
      reloadCart({ silent: true });
    } catch (err) {
      console.error("Lỗi tạo đơn sau thanh toán giả lập:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Không thể tạo đơn. Vui lòng thử lại.";
      showToast(msg);
      setPaying(false);
    }
  };

  return (
    <Container className="py-4 d-flex justify-content-center">
      <Card className="shadow-sm" style={{ maxWidth: "650px", width: "100%" }}>
        <Card.Header className="fw-bold">
          Thanh toán {methodLabel} (giả lập)
        </Card.Header>
        <Card.Body>
          {/* SHIPPING */}
          <Form className="mb-3">
            <Form.Label className="fw-bold">1. Chọn hình thức vận chuyển</Form.Label>
            <div>
              <Form.Check
                type="radio"
                name="shipping"
                id="ship-fast"
                label="Vận chuyển nhanh (20.000 đ)"
                checked={shippingMethod === "FAST"}
                onChange={() => {
                  setShippingMethod("FAST");
                  persistState({ checkoutData: { ...checkoutData, shippingMethod: "FAST" } });
                }}
              />
              <Form.Check
                type="radio"
                name="shipping"
                id="ship-super-fast"
                label="Vận chuyển siêu tốc (30.000 đ)"
                checked={shippingMethod === "SUPER_FAST"}
                onChange={() => {
                  setShippingMethod("SUPER_FAST");
                  persistState({ checkoutData: { ...checkoutData, shippingMethod: "SUPER_FAST" } });
                }}
              />
            </div>
          </Form>

          {/* ORDER COUPON */}
          <Card className="mb-3">
            <Card.Body>
              <div className="fw-bold mb-2">2. Mã giảm tiền hàng</div>

              <Form.Group className="mb-2">
                <Form.Label>Chọn mã công khai</Form.Label>
                <Form.Select
                  value={selectedOrderPublic}
                  onChange={(e) => {
                    const c = e.target.value;
                    setSelectedOrderPublic(c);
                    setOrderInputCode("");
                    validateOrderCode(c);
                  }}
                >
                  <option value="">-- Không chọn --</option>
                  {publicOrderCodes.map((x) => (
                    <option key={x.id} value={x.code}>
                      {x.code} {x.description ? `- ${x.description}` : ""}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Label>Hoặc nhập mã</Form.Label>
              <InputGroup>
                <Form.Control
                  value={orderInputCode}
                  onChange={(e) => setOrderInputCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã (VD: MANGA10)"
                  disabled={!!selectedOrderPublic}
                />
                <Button
                  variant="outline-primary"
                  disabled={!!selectedOrderPublic}
                  onClick={() => validateOrderCode(orderInputCode)}
                >
                  Áp dụng
                </Button>
              </InputGroup>

              {orderCodeError ? (
                <Alert variant="danger" className="py-2 mt-2 mb-0">
                  {orderCodeError}
                </Alert>
              ) : (
                <div className="text-muted small mt-2">
                  Giảm tiền hàng:{" "}
                  <span className="fw-bold text-success">
                    -{Number(orderDiscount).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* SHIP COUPON */}
          <Card className="mb-3">
            <Card.Body>
              <div className="fw-bold mb-2">3. Mã giảm phí vận chuyển</div>

              <Form.Group className="mb-2">
                <Form.Label>Chọn mã công khai</Form.Label>
                <Form.Select
                  value={selectedShipPublic}
                  onChange={(e) => {
                    const c = e.target.value;
                    setSelectedShipPublic(c);
                    setShipInputCode("");
                    validateShipCode(c);
                  }}
                >
                  <option value="">-- Không chọn --</option>
                  {publicShipCodes.map((x) => (
                    <option key={x.id} value={x.code}>
                      {x.code} {x.description ? `- ${x.description}` : ""}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Label>Hoặc nhập mã</Form.Label>
              <InputGroup>
                <Form.Control
                  value={shipInputCode}
                  onChange={(e) => setShipInputCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã ship"
                  disabled={!!selectedShipPublic}
                />
                <Button
                  variant="outline-primary"
                  disabled={!!selectedShipPublic}
                  onClick={() => validateShipCode(shipInputCode)}
                >
                  Áp dụng
                </Button>
              </InputGroup>

              {shipCodeError ? (
                <Alert variant="danger" className="py-2 mt-2 mb-0">
                  {shipCodeError}
                </Alert>
              ) : (
                <div className="text-muted small mt-2">
                  Giảm phí ship:{" "}
                  <span className="fw-bold text-success">
                    -{Number(shipDiscount).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* TOTAL */}
          <div className="mb-3">
            <div>
              Tiền hàng:{" "}
              <span className="fw-bold">{Number(itemsTotal).toLocaleString("vi-VN")} đ</span>
            </div>
            <div>
              Phí vận chuyển:{" "}
              <span className="fw-bold">{Number(shippingFee).toLocaleString("vi-VN")} đ</span>
            </div>
            <div>
              Giảm giá:{" "}
              <span className="fw-bold text-success">
                -{Number(orderDiscount + shipDiscount).toLocaleString("vi-VN")} đ
              </span>
            </div>
            <hr className="my-2" />
            <div>
              Số tiền cần thanh toán:{" "}
              <span className="fw-bold text-danger">
                {Number(grandTotal).toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>

          <p className="text-center">
            Vui lòng quét mã QR bên dưới để thanh toán số tiền trên.
          </p>

          {/* QR giả lập */}
          <div className="d-flex justify-content-center mb-3">
            <div
              style={{
                width: "220px",
                height: "220px",
                border: "2px solid #ccc",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                background:
                  "repeating-linear-gradient(45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)",
              }}
            >
              QR CODE DEMO
            </div>
          </div>

          {/* Timer */}
          <div className="text-center mb-2">
            {expired ? (
              <span className="text-danger fw-bold">
                Hết thời gian thanh toán. Đang chuyển bạn về giỏ hàng...
              </span>
            ) : (
              <span>
                Thời gian còn lại: <span className="fw-bold">{secondsLeft}s</span>
              </span>
            )}
          </div>
          <ProgressBar now={(secondsLeft / 60) * 100} className="mb-3" animated />

          <div className="d-flex justify-content-between mt-3">
            <Button as={Link} to="/checkout" variant="secondary">
              ← Quay lại checkout
            </Button>
            <Button
              variant="success"
              disabled={expired || paying}
              onClick={handleConfirmPaid}
            >
              {paying ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" /> Đang xác nhận...
                </>
              ) : (
                "Tôi đã thanh toán"
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PaymentPage;
