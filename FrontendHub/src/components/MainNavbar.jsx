// src/components/MainNavbar.jsx
import { Navbar, Container, Nav, Button, Dropdown, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function MainNavbar() {
  const navigate = useNavigate();

  const { user, token, isAdmin, logout } = useAuth();

  const { cartItems } = useCart();
  const cartCount = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm py-2">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 text-primary">
          <span className="me-2">🛒</span>
          Manga<span className="text-dark">.com</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          {/* Menu trái */}
          <Nav className="me-auto">
            {!isAdmin && (
            <Nav.Link as={Link} to="/">
              Trang chủ
            </Nav.Link>
          )}

            {/* User thường có giỏ hàng */}
            {!isAdmin && (
              <Nav.Link as={Link} to="/cart">
                Giỏ hàng{" "}
                {cartCount > 0 && (
                  <Badge bg="danger" pill className="ms-1">
                    {cartCount}
                  </Badge>
                )}
              </Nav.Link>
            )}

            {/* Admin có trang quản trị truyện */}
            {isAdmin && (
              <>
                <Nav.Link as={Link} to="/admin/comics">
                  Quản trị truyện
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/users">
                  Quản trị người dùng
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/orders">
                  Đơn hàng
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/discount-codes">
                  Mã giảm giá
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/reviews">
                  Quản lý đánh giá
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/reports">
                  Báo cáo
                </Nav.Link>
              </>
            )}
          </Nav>

          {/* Menu phải */}
          <Nav className="align-items-center gap-2">
            {/* Chưa đăng nhập */}
            {!token && (
              <>
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  size="sm"
                >
                  Đăng nhập
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  variant="primary"
                  size="sm"
                >
                  Đăng ký
                </Button>
              </>
            )}

            {/* Đã đăng nhập */}
            {token && (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  size="sm"
                  id="dropdown-user"
                >
                  👤 {user?.username || "Tài khoản"}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {/* Hồ sơ cá nhân: ai đăng nhập cũng thấy */}
                  <Dropdown.Item as={Link} to="/profile">
                    Hồ sơ cá nhân
                  </Dropdown.Item>

                  {/* Đơn hàng của tôi: chỉ user thường, không phải admin */}
                  {!isAdmin && (
                    <>
                    <Dropdown.Item as={Link} to="/orders">
                      Đơn hàng của tôi
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/my-reviews">
                      Đánh giá của tôi
                    </Dropdown.Item>
                    </>
                  )}

                  <Dropdown.Divider />
                  <Dropdown.Item disabled>
                    Vai trò: {isAdmin ? "Admin" : "User"}
                  </Dropdown.Item>
                  <Dropdown.Divider />

                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MainNavbar;
