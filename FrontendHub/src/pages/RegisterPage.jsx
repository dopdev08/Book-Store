import { useState } from "react";
import { Container, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setLoading(true);
    try {
      // ⚠ Sửa field cho đúng với RegisterRequest bên backend của bạn nếu khác
      await authApi.register({
        username,
        email,
        password,
      });

      setSuccess("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      setError("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container className="d-flex justify-content-center align-items-center auth-container">
        <div className="auth-card shadow">
          <Row>
            <Col className="text-center mb-3">
              <div className="auth-logo mb-2">manga.com</div>
              <h1 className="auth-title">Manga.com</h1>
              <div className="auth-tabs mt-3">
                <span className="auth-tab">
                  <Link to="/login" className="text-decoration-none">
                    Đăng nhập
                  </Link>
                </span>
                <span className="auth-tab active">Đăng ký</span>
              </div>
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                className="auth-input"
                placeholder="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                className="auth-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Hiển thị mật khẩu"
              className="mb-3 small"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />

            <Button
              type="submit"
              className="w-100 auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Đang đăng ký..." : "ĐĂNG KÝ"}
            </Button>
          </Form>

          <div className="text-center mt-3 small">
            Đã có tài khoản?{" "}
            <Link to="/login" className="auth-link">
              Đăng nhập
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default RegisterPage;
