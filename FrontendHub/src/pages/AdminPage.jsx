import { Container, Alert } from "react-bootstrap";

function AdminPage() {
  return (
    <Container className="py-4">
      <h3 className="fw-bold mb-3">Trang quản trị</h3>

      <Alert variant="info">
        Bạn đang đăng nhập với quyền <b>Quản trị viên</b>.
        <br />
        Vui lòng sử dụng menu phía trên để quản lý hệ thống.
      </Alert>
    </Container>
  );
}

export default AdminPage;
