// src/pages/AdminUserOrdersPage.jsx
import { useEffect, useState } from "react";
import {
  Container,
  Spinner,
  Alert,
  Card,
  Badge,
  Table,
  Button,
} from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import { adminUserApi } from "../api/adminUserApi";

function AdminUserOrdersPage() {
  const { id } = useParams(); // userId từ URL
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminUserApi.getUserOrders(id);
      setOrders(data || []);
    } catch (e) {
      console.error("Lỗi tải đơn hàng người dùng:", e);
      setError("Không thể tải đơn hàng của người dùng này.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [id]);

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

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0">Đơn hàng của người dùng #{id}</h3>
        <Button as={Link} to="/admin/users" variant="secondary">
          ← Quay lại danh sách người dùng
        </Button>
      </div>

      {error && (
        <Alert
          variant="danger"
          onClose={() => setError("")}
          dismissible
          className="mb-3"
        >
          {error}
        </Alert>
      )}

      {!orders.length && !error && (
        <Alert variant="info">Người dùng này chưa có đơn hàng nào.</Alert>
      )}

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
                <Badge pill bg={statusVariant(order.status)} className="mb-1">
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
                        ? (
                            Number(item.price) * item.quantity
                          ).toLocaleString("vi-VN")
                        : 0}{" "}
                      đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default AdminUserOrdersPage;
