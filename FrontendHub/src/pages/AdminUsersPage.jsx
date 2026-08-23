// src/pages/AdminUsersPage.jsx
import { useEffect, useState } from "react";
import {
  Container,
  Table,
  Spinner,
  Alert,
  Button,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { adminUserApi } from "../api/adminUserApi";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminUserApi.getAllUsers();
      setUsers(data || []);
    } catch (e) {
      console.error("Lỗi tải danh sách người dùng:", e);
      setError("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleActive = async (user) => {
    try {
      await adminUserApi.setUserActive(user.id, !user.active);
      await loadUsers();
    } catch (e) {
      console.error("Lỗi cập nhật trạng thái người dùng:", e);
      setError("Không thể cập nhật trạng thái tài khoản.");
    }
  };

  const goToUserOrders = (userId) => {
    navigate(`/admin/users/${userId}/orders`);
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
      <h3 className="fw-bold mb-3">Quản lý người dùng</h3>

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

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tài khoản</th>
            <th>Email</th>
            <th>Họ tên</th>
            <th>SĐT</th>
            <th>Địa chỉ</th>
            <th>Quyền</th>
            <th>Trạng thái</th>
            <th style={{ width: "200px" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center">
                Không có người dùng nào.
              </td>
            </tr>
          )}

          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.fullName || "-"}</td>
              <td>{u.phone || "-"}</td>
              <td>{u.address || "-"}</td>
              <td>
                {(u.roles || []).map((r) => (
                  <Badge bg="secondary" className="me-1" key={r}>
                    {r}
                  </Badge>
                ))}
              </td>
              <td>
                {u.active ? (
                  <Badge bg="success">Đang hoạt động</Badge>
                ) : (
                  <Badge bg="danger">Đã khóa</Badge>
                )}
              </td>
              <td>
                <Button
                  size="sm"
                  variant={u.active ? "outline-danger" : "outline-success"}
                  className="me-2"
                  onClick={() => handleToggleActive(u)}
                >
                  {u.active ? "Khóa" : "Mở khóa"}
                </Button>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => goToUserOrders(u.id)}
                >
                  Xem đơn hàng
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default AdminUsersPage;
