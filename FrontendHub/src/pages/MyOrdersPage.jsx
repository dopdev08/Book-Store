// src/pages/MyOrdersPage.jsx
import { useEffect, useState } from "react";
import {
  Container,
  Table,
  Spinner,
  Alert,
  Badge,
  Card,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { orderApi } from "../api/orderApi";
import { reviewApi } from "../api/reviewApi";
import { useToast } from "../context/ToastContext";

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { showToast } = useToast();

  // Modal đánh giá
  const [showModal, setShowModal] = useState(false);
  const [selectedComic, setSelectedComic] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await orderApi.getMyOrders();
        setOrders(data || []);
      } catch (e) {
        console.error("Lỗi tải đơn hàng:", e.response?.data || e.message);
        setError("Không thể tải danh sách đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDateTime = (value) => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleString("vi-VN");
    } catch {
      return value;
    }
  };

  const statusVariant = (status) => {
    switch (status) {
      case "PAID":
        return "success";
      case "CANCELLED":
        return "secondary";
      case "PENDING":
      default:
        return "warning";
    }
  };

  // mở modal đánh giá – chỉ cho đơn PAID
  const handleOpenReview = (comic, orderStatus) => {
    if (orderStatus !== "PAID") {
      showToast("Bạn chỉ có thể đánh giá truyện ở đơn đã thanh toán.");
      return;
    }
    setSelectedComic(comic);
    setRating(5);
    setComment("");
    setShowModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedComic) return;

    try {
      setSubmitting(true);
      await reviewApi.createOrUpdate({
        comicId: selectedComic.id,
        rating,
        comment,
      });
      showToast("Đã gửi đánh giá của bạn!");
      setShowModal(false);
    } catch (e) {
      console.error("Lỗi gửi đánh giá:", e);
      const msg =
        e.response?.data?.message ||
        "Không thể gửi đánh giá. Có thể bạn chưa thanh toán đơn hàng.";
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!orders.length) {
    return (
      <Container className="py-4">
        <Alert variant="info">Bạn chưa có đơn hàng nào.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="fw-bold mb-3">Đơn hàng của tôi</h3>

      {orders.map((order) => (
        <Card className="mb-3 shadow-sm" key={order.id}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <div className="fw-bold">Mã đơn: #{order.id}</div>
                <div className="text-muted small">
                  Ngày tạo: {formatDateTime(order.createdAt)}
                </div>
              </div>
              <div className="text-end">
                <Badge
                  pill
                  bg={statusVariant(order.status)}
                  className="mb-1 text-uppercase"
                >
                  {order.status}
                </Badge>
                <div className="fw-bold text-danger">
                  Tổng:{" "}
                  {order.totalPrice
                    ? Number(order.totalPrice).toLocaleString("vi-VN")
                    : 0}{" "}
                  đ
                </div>
              </div>
            </div>

            <Table bordered size="sm" responsive className="mb-0">
              <thead>
                <tr>
                  <th>Truyện</th>
                  <th style={{ width: "80px" }}>SL</th>
                  <th style={{ width: "140px" }}>Đơn giá</th>
                  <th style={{ width: "140px" }}>Thành tiền</th>
                  <th style={{ width: "130px" }}>Đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item) => (
                  <tr key={item.id}>
                    <td>{item.comic?.title || "Truyện"}</td>
                    <td>{item.quantity}</td>
                    <td>
                      {item.price
                        ? Number(item.price).toLocaleString("vi-VN")
                        : 0}{" "}
                      đ
                    </td>
                    <td>
                      {item.price && item.quantity
                        ? (Number(item.price) * item.quantity).toLocaleString(
                            "vi-VN"
                          )
                        : 0}{" "}
                      đ
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          handleOpenReview(item.comic, order.status)
                        }
                      >
                        Đánh giá
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ))}

      {/* Modal đánh giá */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmitReview}>
          <Modal.Header closeButton>
            <Modal.Title>
              Đánh giá truyện{" "}
              {selectedComic ? `"${selectedComic.title}"` : ""}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Điểm đánh giá (1–5)</Form.Label>
              <Form.Select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                disabled={submitting}
              >
                {[5, 4, 3, 2, 1].map((v) => (
                  <option key={v} value={v}>
                    {v} sao
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Bình luận</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={submitting}
                placeholder="Cảm nhận của bạn về truyện..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default MyOrdersPage;
