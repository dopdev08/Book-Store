import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
  Modal, // ✅ THÊM
} from "react-bootstrap";
import { comicApi } from "../api/comicApi";
import { useCart } from "../context/CartContext";
import { reviewApi } from "../api/reviewApi";

function ComicDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ THÊM

  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCart();

  const [buying, setBuying] = useState(false); // ✅ THÊM

  // ✅ THÊM: modal đọc thử
  const [showPreview, setShowPreview] = useState(false);

  // ✅ THÊM: số lượng (qty)
  const [qty, setQty] = useState(1);

  // ⭐ State cho review (chỉ hiển thị)
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);

  // ------- LOAD TRUYỆN -------
  useEffect(() => {
    const fetchComic = async () => {
      try {
        setLoading(true);
        setError("");
        setQty(1); // ✅ reset qty khi đổi truyện
        const data = await comicApi.getOne(id); // backend đã lọc active=true
        setComic(data);
      } catch (e) {
        console.error(e);
        const status = e?.response?.status;

        // ✅ 404 = không tồn tại hoặc đã dừng bán (backend chặn active=false)
        if (status === 404) {
          setError("Truyện đã dừng bán hoặc không tồn tại.");
        } else {
          setError("Không tải được thông tin truyện.");
        }

        setComic(null);
      } finally {
        setLoading(false);
      }
    };

    fetchComic();
  }, [id]);

  // ------- LOAD REVIEW -------
  const loadReviews = async () => {
    try {
      const data = await reviewApi.getByComic(id); // GET /api/reviews/comic/{id}
      const list = data || [];
      setReviews(list);

      if (list.length > 0) {
        const sum = list.reduce((s, r) => s + (r.rating || 0), 0);
        const avg = sum / list.length;
        setAvgRating(avg);
        setReviewCount(list.length);
      } else {
        setAvgRating(null);
        setReviewCount(0);
      }
    } catch (e) {
      console.error("Lỗi load đánh giá:", e);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [id]);

  const formatStars = (rating) => {
    const full = Math.round(rating || 0);
    const stars = "★★★★★";
    const empty = "☆☆☆☆☆";
    return stars.slice(0, full) + empty.slice(0, 5 - full);
  };

  const stockNum = useMemo(() => Number(comic?.stock ?? 0), [comic]);
  const isActive = comic?.active !== false; // phòng hờ nếu sau này backend trả active
  const outOfStock = stockNum <= 0;

  // ✅ THÊM: clamp qty theo tồn kho
  const maxQty = Math.max(1, stockNum || 1);
  const clampQty = (n) => Math.min(Math.max(1, n), maxQty);

  // ✅ THÊM: nếu tồn kho thay đổi (hoặc vừa load comic), tự chỉnh qty nếu vượt quá max
  useEffect(() => {
    setQty((q) => clampQty(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxQty]);

  const stockBadge = () => {
    if (outOfStock) return <Badge bg="danger">Hết hàng</Badge>;
    if (stockNum <= 5) return <Badge bg="warning">Sắp hết ({stockNum})</Badge>;
    return <Badge bg="success">Còn hàng</Badge>;
  };

  const handleAddToCart = () => {
    if (!comic) return;
    if (!isActive) return;
    if (outOfStock) {
      alert("Sản phẩm đã hết hàng.");
      return;
    }
    addToCart(comic, qty); // ✅ dùng qty
  };

  // ✅ THÊM: MUA NGAY = THÊM VÀO GIỎ RỒI CHUYỂN SANG CHECKOUT
  const handleBuyNow = async () => {
    if (!comic) return;
    if (!isActive) return;
    if (outOfStock) {
      alert("Sản phẩm đã hết hàng.");
      return;
    }

    try {
      setBuying(true);

      // Nếu addToCart là async thì await được; nếu không async cũng không sao.
      await Promise.resolve(addToCart(comic, qty)); // ✅ dùng qty

      // ✅ Chuyển sang trang thanh toán (nếu bạn chưa có /checkout thì đổi thành /cart)
      navigate("/checkout");
    } catch (e) {
      console.error(e);
      alert("Không thể mua ngay. Vui lòng thử lại.");
    } finally {
      setBuying(false);
    }
  };

  // ------- RENDER -------
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
        <Alert variant="warning">{error}</Alert>
        <Button as={Link} to="/" variant="primary" className="mt-3">
          ← Quay lại
        </Button>
      </Container>
    );
  }

  if (!comic) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Truyện đã dừng bán hoặc không tồn tại.</Alert>
        <Button as={Link} to="/" variant="primary" className="mt-3">
          ← Quay lại
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="g-4">
        <Col md={4}>
          <Card className="shadow-sm">
            {comic.thumbnailUrl && (
              <Card.Img
                src={comic.thumbnailUrl}
                alt={comic.title}
                className="comic-detail-image"
              />
            )}
          </Card>
        </Col>

        <Col md={8}>
          <div className="d-flex align-items-start justify-content-between gap-2">
            <h3 className="fw-bold mb-2">{comic.title}</h3>
            {stockBadge()}
          </div>

          {comic.categoryName && (
            <Badge bg="info" className="mb-3">
              {comic.categoryName}
            </Badge>
          )}

          {!isActive && (
            <Alert variant="secondary" className="py-2">
              Truyện hiện đang dừng bán.
            </Alert>
          )}

          {outOfStock && (
            <Alert variant="danger" className="py-2">
              Truyện hiện đã <b>hết hàng</b>. Vui lòng quay lại sau.
            </Alert>
          )}

          <p className="text-muted">
            Tác giả: <strong>{comic.author || "Đang cập nhật"}</strong>
          </p>

          <p>{comic.description || "Chưa có mô tả chi tiết."}</p>

          <h4 className="text-danger fw-bold my-3">
            {comic.price?.toLocaleString("vi-VN")} đ
          </h4>

          <div className="small text-muted mb-3">
            Tồn kho: <b>{stockNum}</b>
          </div>

          {/* ✅ NÚT ĐỌC THỬ (chỉ hiện khi có previewUrl) */}
          {comic.previewUrl && (
            <div className="mb-3">
              <Button
                variant="outline-primary"
                onClick={() => setShowPreview(true)}
              >
                📖 Đọc thử (PDF)
              </Button>
            </div>
          )}

          {/* TÓM TẮT RATING (chỉ đọc) */}
          <div className="mb-3">
            {reviewCount > 0 ? (
              <div>
                <span className="fw-bold">{avgRating?.toFixed(1)} / 5 </span>
                <span className="text-warning ms-2">
                  {formatStars(avgRating)}
                </span>
                <span className="ms-2 text-muted">
                  ({reviewCount} đánh giá)
                </span>
              </div>
            ) : (
              <span className="text-muted">
                Chưa có đánh giá nào cho truyện này.
              </span>
            )}
          </div>

          {/* ✅ THÊM: CHỌN SỐ LƯỢNG (- / input / +) */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="text-muted">Số lượng:</span>

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setQty((q) => clampQty(q - 1))}
              disabled={!isActive || outOfStock || qty <= 1}
            >
              -
            </Button>

            <input
              type="number"
              value={qty}
              min={1}
              max={maxQty}
              disabled={!isActive || outOfStock}
              onChange={(e) => {
                const raw = e.target.value;
                // cho phép người dùng xoá tạm thời, rồi khi blur sẽ clamp
                if (raw === "") {
                  setQty(1);
                  return;
                }
                const n = Number(raw);
                if (!Number.isFinite(n)) return;
                setQty(clampQty(Math.floor(n)));
              }}
              onBlur={() => setQty((q) => clampQty(q))}
              style={{
                width: 80,
                textAlign: "center",
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid #ced4da",
              }}
            />

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setQty((q) => clampQty(q + 1))}
              disabled={!isActive || outOfStock || qty >= maxQty}
            >
              +
            </Button>

            <span className="text-muted small ms-2">(tối đa {maxQty})</span>
          </div>

          <div className="d-flex gap-2 mt-3">
            <Button
              variant={outOfStock ? "secondary" : "primary"}
              onClick={handleAddToCart}
              disabled={!isActive || outOfStock}
            >
              {outOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
            </Button>

            {/* ✅ THÊM NÚT MUA NGAY */}
            <Button
              variant="danger"
              onClick={handleBuyNow}
              disabled={!isActive || outOfStock || buying}
            >
              {buying ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Đang xử lý...
                </>
              ) : (
                "Mua ngay"
              )}
            </Button>

            <Button as={Link} to="/" variant="outline-secondary">
              ← Quay lại danh sách
            </Button>
          </div>
        </Col>
      </Row>

      {/* ✅ MODAL ĐỌC THỬ PDF */}
      <Modal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Đọc thử: {comic.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 0 }}>
          <iframe
            src={comic.previewUrl}
            title="preview"
            style={{ width: "100%", height: "85vh", border: "0" }}
          />
        </Modal.Body>
      </Modal>

      {/* DANH SÁCH REVIEW (chỉ hiển thị) */}
      <Row className="mt-5">
        <Col md={8}>
          <h5 className="fw-bold mb-3">Đánh giá từ người dùng</h5>
          {reviews.length === 0 && (
            <p className="text-muted">
              Chưa có đánh giá nào. Hãy mua truyện và đánh giá trong mục "Đơn
              hàng của tôi".
            </p>
          )}

          {reviews.map((r) => (
            <Card key={r.id} className="mb-2">
              <Card.Body>
                <div className="d-flex justify-content-between mb-1">
                  <strong>{r.username}</strong>
                  <span className="text-warning">
                    {formatStars(r.rating)} ({r.rating}/5)
                  </span>
                </div>
                <div className="text-muted small mb-1">
                  {r.createdAt?.replace("T", " ").slice(0, 19)}
                </div>
                <div>{r.comment}</div>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
    </Container>
  );
}

export default ComicDetailPage;
