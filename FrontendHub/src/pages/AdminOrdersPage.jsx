// src/pages/AdminOrdersPage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Table,
  Badge,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { orderApi } from "../api/orderApi";
import { useToast } from "../context/ToastContext";

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await orderApi.getAllOrdersAdmin();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Không tải được danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const renderStatusBadge = (status) => {
    if (status === "PAID") return <Badge bg="success">Đã thanh toán</Badge>;
    if (status === "CANCELLED") return <Badge bg="secondary">Đã hủy</Badge>;
    return (
      <Badge bg="warning" text="dark">
        Đang chờ
      </Badge>
    );
  };

  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      showToast("Cập nhật trạng thái đơn thành công!");
      await loadOrders();
    } catch (err) {
      console.error(err);
      showToast("Không thể cập nhật trạng thái đơn!");
    }
  };

  // ✅ Đảo đơn mới nhất lên trên theo createdAt
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const ta = a?.createdAt ? Date.parse(a.createdAt) : 0;
      const tb = b?.createdAt ? Date.parse(b.createdAt) : 0;
      return tb - ta; // desc
    });
  }, [orders]);

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2>Quản lý đơn hàng (Admin)</h2>

      {error && (
        <Alert
          variant="danger"
          className="mt-3"
          onClose={() => setError("")}
          dismissible
        >
          {error}
        </Alert>
      )}

      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Thời gian</th>
            <th>Khách hàng</th>
            <th>Địa chỉ giao hàng</th> {/* ✅ NEW */}
            <th>Thanh toán</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Thay đổi trạng thái</th>
          </tr>
        </thead>

        <tbody>
          {sortedOrders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.createdAt?.replace("T", " ").slice(0, 19)}</td>
              <td>{o.user?.username || o.user?.email}</td>

              {/* ✅ Hiển thị address dạng String */}
              <td style={{ minWidth: "260px", whiteSpace: "pre-line" }}>
                {o.address || "—"}
              </td>

              <td>{o.paymentMethod || "Chuyển khoản"}</td>
              <td>{o.totalPrice?.toLocaleString("vi-VN")} đ</td>
              <td>{renderStatusBadge(o.status)}</td>

              <td style={{ minWidth: "160px" }}>
                <Form.Select
                  size="sm"
                  value={o.status}
                  onChange={(e) => handleChangeStatus(o.id, e.target.value)}
                  // tuỳ chọn: khóa dropdown nếu đã hủy
                  // disabled={o.status === "CANCELLED"}
                >
                  <option value="PENDING">Đang chờ</option>
                  <option value="PAID">Đã thanh toán</option>
                  <option value="CANCELLED">Đã hủy</option>
                </Form.Select>
              </td>
            </tr>
          ))}

          {sortedOrders.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center">
                Chưa có đơn hàng nào.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default AdminOrdersPage;
