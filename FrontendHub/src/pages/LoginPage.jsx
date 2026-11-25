import { useState } from "react";
import { Container, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true); // luôn lưu token cũng được
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // BACKEND đang yêu cầu field "username" (theo log bạn gửi)
      const data = await authApi.login({
        email: usernameOrEmail,
        password,
      });

      // Lưu vào context + localStorage
      login(
        {
          id: data.id,
          username: data.username,
          email: data.email,
          roles: data.roles,
        },
        data.token
      );

      // (tuỳ bạn có dùng remember nữa hay không, giờ login() đã lưu rồi)

      const roles = data.roles || [];
      const isAdmin =
      roles.includes("ROLE_ADMIN") || roles.includes("ADMIN");

      navigate(isAdmin ? "/admin" : "/");
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu.";

      setError(msg);
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
                <span className="auth-tab active">Đăng nhập</span>
                <span className="auth-tab">
                  <Link to="/register" className="text-decoration-none">
                    Đăng ký
                  </Link>
                </span>
              </div>
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                className="auth-input"
                placeholder="Email / Số điện thoại"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Control
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Row className="mb-3 small">
              <Col xs="auto">
                <Form.Check
                  type="checkbox"
                  label="Hiển thị mật khẩu"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
              </Col>
              <Col xs="auto">
                <Form.Check
                  type="checkbox"
                  label="Lưu mật khẩu"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
              </Col>
            </Row>

            <Button
              type="submit"
              className="w-100 auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
            </Button>
          </Form>

          <Row className="mb-3 mt-3 small text-center">
            <Col>
              <a href="#" className="auth-link">
                Quên mật khẩu
              </a>
            </Col>
            <Col>
              <a href="#" className="auth-link">
                Đăng nhập với SMS
              </a>
            </Col>
          </Row>

          <div className="auth-divider">
            <span>HOẶC</span>
          </div>

          <Row className="g-2">
            <Col xs={12} md={6}>
              <Button variant="light" className="w-100 social-btn">
                <span className="social-icon">f</span> Facebook
              </Button>
            </Col>
            <Col xs={12} md={6}>
              <Button variant="light" className="w-100 social-btn">
                <span className="social-icon">G</span> Google
              </Button>
            </Col>
          </Row>

          <div className="text-center mt-3 small">
            Bạn mới biết đến Manga.com?{" "}
            <Link to="/register" className="auth-link">
              Đăng ký
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default LoginPage;
