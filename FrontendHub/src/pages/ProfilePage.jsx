// src/pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { Container, Card, Form, Button, Spinner, Alert, Row, Col } from "react-bootstrap";
import { userApi } from "../api/userApi";
import { useToast } from "../context/ToastContext";

function ProfilePage() {
  const { showToast } = useToast();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ ADD: đổi mật khẩu
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const user = await userApi.getMe();
        setUsername(user.username || "");
        setEmail(user.email || "");
        setFullName(user.fullName || "");
        setPhone(user.phone || "");
        setAddress(user.address || "");
      } catch (err) {
        console.error("Lỗi load user:", err);
        showToast("Không tải được thông tin tài khoản");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await userApi.updateMe({ fullName, phone, address });
      showToast("Cập nhật thông tin thành công");
    } catch (err) {
      console.error("Lỗi cập nhật user:", err.response?.data || err.message);
      showToast("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  // ✅ ADD: submit đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPwError("Vui lòng nhập đủ các trường mật khẩu.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwError("Mật khẩu mới và xác nhận không khớp.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("Mật khẩu mới tối thiểu 6 ký tự.");
      return;
    }

    try {
      setChangingPw(true);
      await userApi.changePassword({
        oldPassword,
        newPassword,
        confirmNewPassword,
      });

      setPwSuccess("Đổi mật khẩu thành công!");
      showToast("Đổi mật khẩu thành công");

      // reset form
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Đổi mật khẩu thất bại";
      setPwError(msg);
      showToast(msg);
    } finally {
      setChangingPw(false);
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
      <h3 className="mb-4 fw-bold">Hồ sơ cá nhân</h3>

      <Row className="g-3">
        {/* ===== Thông tin cá nhân ===== */}
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="fw-bold mb-3">Thông tin tài khoản</div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên đăng nhập</Form.Label>
                  <Form.Control type="text" value={username} disabled />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={email} disabled />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Họ và tên</Form.Label>
                  <Form.Control
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ tên đầy đủ"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập SĐT"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ mặc định</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ giao hàng mặc định"
                  />
                </Form.Group>

                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* ===== Đổi mật khẩu ===== */}
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="fw-bold mb-3">Đổi mật khẩu</div>

              {pwError && (
                <Alert variant="danger" className="py-2" onClose={() => setPwError("")} dismissible>
                  {pwError}
                </Alert>
              )}
              {pwSuccess && (
                <Alert variant="success" className="py-2" onClose={() => setPwSuccess("")} dismissible>
                  {pwSuccess}
                </Alert>
              )}

              <Form onSubmit={handleChangePassword}>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu hiện tại</Form.Label>
                  <Form.Control
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </Form.Group>

                <Button type="submit" variant="warning" disabled={changingPw}>
                  {changingPw ? "Đang đổi..." : "Đổi mật khẩu"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;
