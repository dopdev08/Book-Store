import { useMemo, useState } from "react";
import { Container, Table, Button, Form, Alert, Spinner, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartPage() {
  const {
    cartItems,
    totalPrice,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  // lỗi theo từng item
  const [qtyErrors, setQtyErrors] = useState({}); // { [itemId]: "message" }

  const normalizeStock = (stock) => {
    const n = Number(stock);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.floor(n));
  };

  const hasInvalidItems = useMemo(() => {
    return cartItems.some((item) => {
      const stock = normalizeStock(item?.comic?.stock);
      const qty = Number(item?.quantity || 0);
      return stock <= 0 || qty <= 0 || qty > stock;
    });
  }, [cartItems]);

  const handleCheckout = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (cartItems.length === 0) return;

    // chặn nếu có item hết hàng hoặc vượt tồn kho
    if (hasInvalidItems) {
      alert("Giỏ hàng có sản phẩm hết hàng hoặc số lượng vượt tồn kho. Vui lòng chỉnh lại trước khi thanh toán.");
      return;
    }

    navigate("/checkout");
  };

  const handleChangeQty = (item, rawValue) => {
    const itemId = item.id;
    const stock = normalizeStock(item?.comic?.stock);
    let nextQty = Number(rawValue);

    // reset lỗi cũ
    setQtyErrors((prev) => {
      const clone = { ...prev };
      delete clone[itemId];
      return clone;
    });

    // không cho nhập NaN
    if (!Number.isFinite(nextQty)) {
      setQtyErrors((prev) => ({ ...prev, [itemId]: "Số lượng không hợp lệ." }));
      return;
    }

    nextQty = Math.floor(nextQty);

    if (stock <= 0) {
      setQtyErrors((prev) => ({ ...prev, [itemId]: "Sản phẩm đã hết hàng." }));
      // có thể tự set về 0 hoặc giữ nguyên; mình giữ nguyên và chặn thanh toán
      return;
    }

    if (nextQty < 1) {
      nextQty = 1;
      setQtyErrors((prev) => ({ ...prev, [itemId]: "Số lượng tối thiểu là 1." }));
    }

    if (nextQty > stock) {
      nextQty = stock;
      setQtyErrors((prev) => ({ ...prev, [itemId]: `Tồn kho chỉ còn ${stock}. Đã tự điều chỉnh.` }));
    }

    // gọi context update
    updateQuantity(itemId, nextQty);
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!loading && cartItems.length === 0) {
    return (
      <Container className="py-4">
        <Alert variant="info">Giỏ hàng đang trống.</Alert>
        <Button as={Link} to="/" variant="primary">
          ← Tiếp tục mua truyện
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="mb-4 fw-bold">Giỏ hàng</h3>

      {hasInvalidItems && (
        <Alert variant="warning">
          Có sản phẩm <b>hết hàng</b> hoặc <b>vượt tồn kho</b>. Bạn cần chỉnh lại trước khi thanh toán.
        </Alert>
      )}

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tiêu đề</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Tạm tính</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => {
            const stock = normalizeStock(item?.comic?.stock);
            const outOfStock = stock <= 0;
            const qty = Number(item?.quantity || 0);

            return (
              <tr key={item.id} style={{ opacity: outOfStock ? 0.6 : 1 }}>
                <td style={{ width: "100px" }}>
                  {item.comic?.thumbnailUrl && (
                    <img
                      src={item.comic.thumbnailUrl}
                      alt={item.comic.title}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </td>

                <td>
                  <div className="fw-semibold">{item.comic?.title}</div>
                  <div className="small text-muted d-flex align-items-center gap-2">
                    <span>Tồn kho: <b>{stock}</b></span>
                    {outOfStock ? (
                      <Badge bg="danger">Hết hàng</Badge>
                    ) : qty > stock ? (
                      <Badge bg="warning">Vượt tồn kho</Badge>
                    ) : (
                      <Badge bg="success">OK</Badge>
                    )}
                  </div>
                  {qtyErrors[item.id] && (
                    <div className="small text-danger mt-1">{qtyErrors[item.id]}</div>
                  )}
                </td>

                <td>{item.comic?.price?.toLocaleString("vi-VN")} đ</td>

                <td style={{ width: "160px" }}>
                  <Form.Control
                    type="number"
                    min={1}
                    step={1}
                    value={item.quantity}
                    disabled={outOfStock}
                    onChange={(e) => handleChangeQty(item, e.target.value)}
                  />
                </td>

                <td>
                  {(item.comic?.price * item.quantity).toLocaleString("vi-VN")} đ
                </td>

                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <Button variant="outline-danger" onClick={clearCart}>
          Xóa toàn bộ giỏ hàng
        </Button>
        <h4 className="text-danger">
          Tổng tiền: {totalPrice.toLocaleString("vi-VN")} đ
        </h4>
      </div>

      <div className="mt-4 d-flex justify-content-between">
        <Button as={Link} to="/" variant="secondary">
          ← Tiếp tục mua truyện
        </Button>
        <Button variant="success" onClick={handleCheckout} disabled={cartItems.length === 0 || hasInvalidItems}>
          Thanh toán
        </Button>
      </div>
    </Container>
  );
}

export default CartPage;
