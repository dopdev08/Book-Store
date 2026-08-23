import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Form,
  Badge,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { comicApi } from "../api/comicApi";

function UserHomePage() {
  const navigate = useNavigate();
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // bộ lọc
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const data = await comicApi.getAll(); // backend đã lọc active=true
        setComics(data || []);
      } catch (e) {
        console.error(e);
        setError("Không tải được danh sách truyện.");
      } finally {
        setLoading(false);
      }
    };

    fetchComics();
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    comics.forEach((c) => c.categoryName && set.add(c.categoryName));
    return Array.from(set);
  }, [comics]);

  const filteredComics = useMemo(() => {
    return comics.filter((c) => {
      const matchSearch =
        search.trim() === "" ||
        (c.title || "").toLowerCase().includes(search.toLowerCase());
      const matchCate =
        categoryFilter === "ALL" ||
        c.categoryName === categoryFilter ||
        !c.categoryName;
      return matchSearch && matchCate;
    });
  }, [comics, search, categoryFilter]);

  const stockBadge = (stock) => {
    const n = Number(stock ?? 0);
    if (n <= 0) return <Badge bg="danger">Hết hàng</Badge>;
    if (n <= 5) return <Badge bg="warning">Sắp hết ({n})</Badge>;
    return <Badge bg="success">Còn hàng</Badge>;
  };

  const handleAddToCart = (comic) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const st = Number(comic?.stock ?? 0);
    if (st <= 0) {
      alert("Sản phẩm đã hết hàng.");
      return;
    }

    // TODO: gọi API /cart/add sau
    alert("Tạm thời chỉ demo UI, phần gọi API giỏ hàng sẽ làm sau.");
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Banner / filter */}
      <Row className="mb-4">
        <Col md={8}>
          <Form.Control
            placeholder="Tìm kiếm truyện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col md={4} className="mt-2 mt-md-0">
          <Form.Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">Tất cả thể loại</option>
            {categories.map((cate) => (
              <option key={cate} value={cate}>
                {cate}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <h4 className="mb-3 fw-bold">Danh mục truyện</h4>

      <Row className="g-4">
        {filteredComics.map((comic) => {
          const stockNum = Number(comic.stock ?? 0);
          const outOfStock = stockNum <= 0;

          return (
            <Col key={comic.id} xs={12} sm={6} md={4} lg={3}>
              <Card className="h-100 shadow-sm">
                {comic.thumbnailUrl && (
                  <Card.Img
                    variant="top"
                    src={comic.thumbnailUrl}
                    alt={comic.title}
                    style={{ height: "220px", objectFit: "cover" }}
                  />
                )}

                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <Card.Title className="fs-6 mb-1">{comic.title}</Card.Title>
                    {stockBadge(comic.stock)}
                  </div>

                  <Card.Text className="text-muted mb-1">
                    {comic.author || "Đang cập nhật"}
                  </Card.Text>

                  {comic.categoryName && (
                    <Card.Text className="text-secondary small mb-2">
                      {comic.categoryName}
                    </Card.Text>
                  )}

                  <Card.Text className="fw-bold text-danger mb-2">
                    {comic.price?.toLocaleString("vi-VN")} đ
                  </Card.Text>

                  {/* tồn kho hiển thị nhỏ gọn */}
                  <div className="small text-muted mb-3">
                    Tồn kho: <b>{stockNum}</b>
                  </div>

                  <div className="mt-auto d-flex justify-content-between gap-2">
                    <Button
                      as={Link}
                      to={`/comics/${comic.id}`}
                      variant="outline-primary"
                      size="sm"
                    >
                      Xem chi tiết
                    </Button>

                    <Button
                      variant={outOfStock ? "secondary" : "primary"}
                      size="sm"
                      disabled={outOfStock}
                      onClick={() => handleAddToCart(comic)}
                      title={outOfStock ? "Hết hàng" : ""}
                    >
                      {outOfStock ? "Hết hàng" : "Thêm vào giỏ"}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}

        {filteredComics.length === 0 && (
          <Col>
            <Alert variant="info">Không tìm thấy truyện phù hợp.</Alert>
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default UserHomePage;
