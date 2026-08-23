// src/pages/UserHomePage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { comicApi } from "../api/comicApi";
import { useCart } from "../context/CartContext";
import SearchBar from "../components/SearchBar";

function UserHomePage() {
  const [comics, setComics] = useState([]);
  const [shuffledComics, setShuffledComics] = useState([]); // ✅ ADD: list đã random
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCart();

  // ✅ bộ lọc
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // ✅ paging kiểu Shopee: chỉ hiển thị dần
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // ✅ ADD: shuffle (Fisher–Yates)
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const data = await comicApi.getAll(); // backend đã lọc active=true
        const list = data || [];
        setComics(list);

        // ✅ ADD: random 1 lần khi load trang (để không bị đổi liên tục mỗi render)
        setShuffledComics(shuffle(list));
      } catch (e) {
        console.error(e);
        setError("Không tải được danh sách truyện");
      } finally {
        setLoading(false);
      }
    };

    fetchComics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ danh sách thể loại từ data
  const categories = useMemo(() => {
    const set = new Set();
    (comics || []).forEach((c) => c.categoryName && set.add(c.categoryName));
    return Array.from(set);
  }, [comics]);

  // ✅ lọc theo search + category (lọc trên toàn bộ list)
  const filteredComics = useMemo(() => {
    const s = search.trim().toLowerCase();

    return (comics || []).filter((c) => {
      const title = (c.title || "").toLowerCase();
      const matchSearch = s === "" || title.includes(s);

      const matchCate =
        categoryFilter === "ALL" ||
        c.categoryName === categoryFilter ||
        !c.categoryName;

      return matchSearch && matchCate;
    });
  }, [comics, search, categoryFilter]);

  // ✅ ADD: có đang lọc/tìm kiếm không?
  const hasFilter = useMemo(() => {
    return search.trim() !== "" || (categoryFilter && categoryFilter !== "ALL");
  }, [search, categoryFilter]);

  // ✅ ADD: nguồn để render
  // - Không filter/search => dùng shuffledComics (ngẫu nhiên)
  // - Có filter/search => dùng filteredComics (đúng kết quả lọc)
  const renderSource = useMemo(() => {
    return hasFilter ? filteredComics : shuffledComics;
  }, [hasFilter, filteredComics, shuffledComics]);

  // ✅ mỗi khi search/category đổi => reset về 12 item đầu
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, categoryFilter]);

  // ✅ danh sách render theo “Xem thêm”
  const visibleComics = useMemo(() => {
    return (renderSource || []).slice(0, visibleCount);
  }, [renderSource, visibleCount]);

  const canLoadMore = visibleCount < (renderSource?.length || 0);

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
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h3 className="mb-0 fw-bold">Danh mục truyện</h3>

        {/* ✅ nhỏ gọn kiểu shopee: hiện số lượng */}
        <div className="text-muted small">
          Hiển thị <b>{visibleComics.length}</b> / <b>{renderSource.length}</b>
        </div>
      </div>

      {/* SearchBar */}
      <SearchBar
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
      />

      <Row className="g-4 mt-1">
        {visibleComics.map((comic) => (
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
                <Card.Title className="fs-6">{comic.title}</Card.Title>

                <Card.Text className="text-muted mb-1">
                  Tác giả: {comic.author || "Đang cập nhật"}
                </Card.Text>

                {comic.categoryName && (
                  <Card.Text className="text-secondary small mb-2">
                    Thể loại: {comic.categoryName}
                  </Card.Text>
                )}

                <Card.Text className="fw-bold text-danger mb-3">
                  {comic.price?.toLocaleString("vi-VN")} đ
                </Card.Text>

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
                    variant="primary"
                    size="sm"
                    onClick={() => addToCart(comic)}
                  >
                    Thêm vào giỏ
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}

        {renderSource.length === 0 && (
          <Col>
            <Alert variant="info" className="mb-0">
              Không tìm thấy truyện phù hợp.
            </Alert>
          </Col>
        )}
      </Row>

      {/* ✅ Nút “Xem thêm” kiểu Shopee/Tiki */}
      {renderSource.length > 0 && (
        <div className="d-flex justify-content-center mt-4">
          {canLoadMore ? (
            <Button
              variant="outline-secondary"
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            >
              Xem thêm
            </Button>
          ) : (
            <div className="text-muted small">Bạn đã xem hết kết quả.</div>
          )}
        </div>
      )}
    </Container>
  );
}

export default UserHomePage;
