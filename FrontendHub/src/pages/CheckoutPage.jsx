// src/pages/CheckoutPage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
  Spinner,
  Alert,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { userApi } from "../api/userApi";
import { orderApi } from "../api/orderApi";
import { useToast } from "../context/ToastContext";
import { discountCodeApi } from "../api/discountCodeApi";

function CheckoutPage() {
  const { cartItems, cartReady, totalPrice, reloadCart } = useCart(); // totalPrice = tiền hàng
  const { showToast } = useToast();
  const navigate = useNavigate();

  // shipping
  const [shippingMethod, setShippingMethod] = useState("FAST"); // FAST | SUPER_FAST
  const shippingFee = useMemo(() => {
    return shippingMethod === "SUPER_FAST" ? 30000 : 20000;
  }, [shippingMethod]);

  // user info
  const [receiverName, setReceiverName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // discount UI
  const [publicOrderCodes, setPublicOrderCodes] = useState([]);
  const [publicShipCodes, setPublicShipCodes] = useState([]);

  const [selectedOrderPublic, setSelectedOrderPublic] = useState(""); // code
  const [orderInputCode, setOrderInputCode] = useState("");
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [orderCodeError, setOrderCodeError] = useState("");

  const [selectedShipPublic, setSelectedShipPublic] = useState(""); // code
  const [shipInputCode, setShipInputCode] = useState("");
  const [shipDiscount, setShipDiscount] = useState(0);
  const [shipCodeError, setShipCodeError] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const normalize = (s) => (s || "").trim().toUpperCase();

  const itemsTotalNum = useMemo(() => Number(totalPrice) || 0, [totalPrice]);
  const shippingFeeNum = useMemo(() => Number(shippingFee) || 0, [shippingFee]);

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
    const original = itemsTotalNum + shippingFeeNum;
    const discountTotal = Number(orderDiscount || 0) + Number(shipDiscount || 0);
    return Math.max(0, original - discountTotal);
  }, [itemsTotalNum, shippingFeeNum, orderDiscount, shipDiscount]);

  // helper call api (tương thích check / checkCode)
  const checkDiscount = async (code) => {
    const fn = discountCodeApi.checkCode || discountCodeApi.check;
    return fn(code);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (!cartReady) return;
    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }

    const init = async () => {
      try {
        const user = await userApi.getMe();
        setReceiverName(user.fullName || user.username || "");
        setPhone(user.phone || "");
        setAddress(user.address || "");

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
      } catch (err) {
        console.error(err);
        showToast("Không tải được dữ liệu checkout");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [cartReady, cartItems.length, navigate, showToast]);

  // ===== Validate CODE =====
  const validateOrderCode = async (code) => {
    setOrderCodeError("");
    const c = normalize(code);
    if (!c) {
      setOrderDiscount(0);
      return;
    }
    try {
      const dc = await checkDiscount(c);
      if (!(dc.scope === "ORDER_TOTAL" || dc.scope === "BOTH")) {
        throw { response: { data: { message: "Mã này không áp dụng cho tiền hàng." } } };
      }
      const d = calcDiscountPreview(dc, itemsTotalNum);
      setOrderDiscount(d);
      setOrderCodeError("");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        "Mã giảm giá không hợp lệ";
      setOrderDiscount(0);
      setOrderCodeError(msg);
    }
  };

  const validateShipCode = async (code) => {
    setShipCodeError("");
    const c = normalize(code);
    if (!c) {
      setShipDiscount(0);
      return;
    }
    try {
      const dc = await checkDiscount(c);
      if (!(dc.scope === "SHIPPING_FEE" || dc.scope === "BOTH")) {
        throw { response: { data: { message: "Mã này không áp dụng cho phí vận chuyển." } } };
      }
      const d = calcDiscountPreview(dc, shippingFeeNum);
      setShipDiscount(d);
      setShipCodeError("");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        "Mã vận chuyển không hợp lệ";
      setShipDiscount(0);
      setShipCodeError(msg);
    }
  };

  // đổi shipping => revalidate ship code
  useEffect(() => {
    const activeCode = normalize(selectedShipPublic) || normalize(shipInputCode);
    if (activeCode) validateShipCode(activeCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingFeeNum]);

  const handlePickOrderPublic = async (code) => {
    const c = normalize(code);
    setSelectedOrderPublic(c);
    setOrderInputCode("");
    await validateOrderCode(c);
  };

  const handlePickShipPublic = async (code) => {
    const c = normalize(code);
    setSelectedShipPublic(c);
    setShipInputCode("");
    await validateShipCode(c);
  };

  const handleApplyOrderInput = async () => {
    const c = normalize(orderInputCode);
    setSelectedOrderPublic("");
    setOrderInputCode(c);
    await validateOrderCode(c);
  };

  const handleApplyShipInput = async () => {
    const c = normalize(shipInputCode);
    setSelectedShipPublic("");
    setShipInputCode(c);
    await validateShipCode(c);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!receiverName || !phone || !address) {
      showToast("Vui lòng nhập đủ Họ tên, SĐT và Địa chỉ");
      return;
    }
    if (orderCodeError || shipCodeError) {
      showToast("Vui lòng kiểm tra lại mã giảm giá");
      return;
    }

    const couponCode =
      normalize(selectedOrderPublic) || normalize(orderInputCode) || null;
    const shippingCouponCode =
      normalize(selectedShipPublic) || normalize(shipInputCode) || null;

    const payload = {
      receiverName,
      phone,
      address,
      note,
      paymentMethod, // COD | VNPAY | MOMO
      shippingMethod, // FAST | SUPER_FAST
      couponCode,
      shippingCouponCode,
    };

    if (paymentMethod === "COD") {
      try {
        setSubmitting(true);
        const order = await orderApi.createOrder(payload);
        showToast(`Đặt hàng thành công! Mã đơn #${order.id}`);

        // ✅ tránh bị nhảy trang do reloadCart làm cart rỗng
        navigate("/orders");
        reloadCart(); // không await
      } catch (err) {
        console.error("Lỗi tạo đơn:", err.response?.data || err.message);
        const msg =
          err?.response?.data?.message ||
          err?.response?.data ||
          "Đặt hàng thất bại. Vui lòng thử lại.";
        showToast(msg);
      } finally {
        setSubmitting(false);
      }
    } else {
      // ✅ QUAN TRỌNG: lưu state để sang PaymentPage vẫn còn mã + tổng tiền đã giảm
      const navState = {
        checkoutData: payload,
        pricing: {
          itemsTotal: itemsTotalNum,
          shippingFee: shippingFeeNum,
          orderDiscount: Number(orderDiscount || 0),
          shipDiscount: Number(shipDiscount || 0),
          grandTotal: Number(grandTotal || 0),
        },
        codes: { couponCode, shippingCouponCode },
      };

      sessionStorage.setItem("checkout_state", JSON.stringify(navState));
      navigate("/payment", { state: navState });
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="mb-4 fw-bold">Thanh toán</h3>
      <Row className="g-4">
        <Col md={7}>
          <Card className="shadow-sm mb-3">
            <Card.Header className="fw-bold">Thông tin nhận hàng</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ và tên</Form.Label>
                  <Form.Control
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ giao hàng</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Giao giờ hành chính..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Vận chuyển</Form.Label>
                  <Form.Select
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  >
                    <option value="FAST">Vận chuyển nhanh (20.000đ)</option>
                    <option value="SUPER_FAST">Vận chuyển siêu tốc (30.000đ)</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phương thức thanh toán</Form.Label>
                  <Form.Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                    <option value="VNPAY">VNPay (giả lập)</option>
                    <option value="MOMO">Momo (giả lập)</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-flex justify-content-between mt-4">
                  <Button as={Link} to="/cart" variant="secondary">
                    ← Quay lại giỏ hàng
                  </Button>
                  <Button type="submit" variant="success" disabled={submitting}>
                    {submitting ? "Đang xử lý..." : "Tiếp tục"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* ===== COUPON: ORDER TOTAL ===== */}
          <Card className="shadow-sm mb-3">
            <Card.Header className="fw-bold">Mã giảm tiền hàng</Card.Header>
            <Card.Body>
              <Form.Group className="mb-2">
                <Form.Label>Chọn mã công khai</Form.Label>
                <Form.Select
                  value={selectedOrderPublic}
                  onChange={(e) => handlePickOrderPublic(e.target.value)}
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
              <InputGroup className="mb-2">
                <Form.Control
                  value={orderInputCode}
                  onChange={(e) => setOrderInputCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã (VD: MANGA10)"
                  disabled={!!selectedOrderPublic}
                />
                <Button
                  variant="outline-primary"
                  onClick={handleApplyOrderInput}
                  disabled={!!selectedOrderPublic}
                >
                  Áp dụng
                </Button>
              </InputGroup>

              {orderCodeError ? (
                <Alert variant="danger" className="py-2 mb-0">
                  {orderCodeError}
                </Alert>
              ) : (
                <div className="text-muted small">
                  Giảm tiền hàng:{" "}
                  <span className="fw-bold text-success">
                    -{Number(orderDiscount).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* ===== COUPON: SHIPPING ===== */}
          <Card className="shadow-sm">
            <Card.Header className="fw-bold">Mã giảm phí vận chuyển</Card.Header>
            <Card.Body>
              <Form.Group className="mb-2">
                <Form.Label>Chọn mã công khai</Form.Label>
                <Form.Select
                  value={selectedShipPublic}
                  onChange={(e) => handlePickShipPublic(e.target.value)}
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
              <InputGroup className="mb-2">
                <Form.Control
                  value={shipInputCode}
                  onChange={(e) => setShipInputCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã ship"
                  disabled={!!selectedShipPublic}
                />
                <Button
                  variant="outline-primary"
                  onClick={handleApplyShipInput}
                  disabled={!!selectedShipPublic}
                >
                  Áp dụng
                </Button>
              </InputGroup>

              {shipCodeError ? (
                <Alert variant="danger" className="py-2 mb-0">
                  {shipCodeError}
                </Alert>
              ) : (
                <div className="text-muted small">
                  Giảm phí ship:{" "}
                  <span className="fw-bold text-success">
                    -{Number(shipDiscount).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Summary */}
        <Col md={5}>
          <Card className="shadow-sm">
            <Card.Header className="fw-bold">Tóm tắt đơn hàng</Card.Header>
            <Card.Body>
              <ListGroup variant="flush" className="mb-3">
                {cartItems.map((item) => (
                  <ListGroup.Item
                    key={item.id}
                    className="d-flex justify-content-between"
                  >
                    <div>
                      <div className="fw-semibold">
                        {item.comic?.title || "Sản phẩm"}
                      </div>
                      <div className="small text-muted">
                        x{item.quantity} ·{" "}
                        {item.comic?.price?.toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                    <div className="fw-bold">
                      {(item.comic?.price * item.quantity).toLocaleString("vi-VN")} đ
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <div className="d-flex justify-content-between mb-1">
                <span>Tạm tính</span>
                <span className="fw-bold">{itemsTotalNum.toLocaleString("vi-VN")} đ</span>
              </div>

              <div className="d-flex justify-content-between mb-1">
                <span>Phí vận chuyển</span>
                <span className="fw-bold">{shippingFeeNum.toLocaleString("vi-VN")} đ</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Giảm giá</span>
                <span className="fw-bold text-success">
                  -{Number(orderDiscount + shipDiscount).toLocaleString("vi-VN")} đ
                </span>
              </div>

              <hr />

              <div className="d-flex justify-content-between">
                <span className="fw-bold">Tổng thanh toán</span>
                <span className="fw-bold text-danger">
                  {Number(grandTotal).toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="mt-2">
                <Badge bg="secondary">
                  {paymentMethod === "COD" ? "COD" : "Online (giả lập)"}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CheckoutPage;
