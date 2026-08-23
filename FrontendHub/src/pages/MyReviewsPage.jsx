// src/pages/MyReviewsPage.jsx
import { useEffect, useState } from "react";
import {
  Container,
  Card,
  Spinner,
  Alert,
  Button,
  Badge,
  Modal,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { reviewApi } from "../api/reviewApi";
import { comicApi } from "../api/comicApi";
import { useToast } from "../context/ToastContext";

function MyReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comicMap, setComicMap] = useState({});
  const { showToast } = useToast();

  // ✅ Confirm modal (NEW) - thay window.confirm (không đổi logic xoá)
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmReview, setConfirmReview] = useState(null); // review object

  // tải đánh giá
  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await reviewApi.getMyReviews();
        setReviews(data || []);

        // tải thêm thông tin truyện (để có ảnh, nếu muốn)
        const ids = [...new Set((data || []).map((r) => r.comicId))];
        const newMap = {};
        for (const id of ids) {
          try {
            const c = await comicApi.getOne(id);
            newMap[id] = c;
          } catch {
            // bỏ qua
          }
        }
        setComicMap(newMap);
      } catch (e) {
        console.error("Lỗi tải đánh giá của tôi:", e.response?.data || e);
        setError("Không thể tải danh sách đánh giá.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyReviews();
  }, []);

  // ✅ mở confirm modal
  const handleDelete = (review) => {
    setConfirmReview(review);
    setShowConfirm(true);
  };

  // ✅ xoá sau khi confirm
  const handleConfirmDelete = async () => {
    if (!confirmReview?.id) return;

    try {
      await reviewApi.deleteReview(confirmReview.id);
      setReviews((prev) => prev.filter((r) => r.id !== confirmReview.id));
      showToast("Đã xóa đánh giá.");
    } catch (e) {
      console.error("Lỗi xóa đánh giá:", e.response?.data || e);
      showToast("Không thể xóa đánh giá.");
    } finally {
      setShowConfirm(false);
      setConfirmReview(null);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleString("vi-VN");
    } catch {
      return value;
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!reviews.length) {
    return (
      <Container className="py-4">
        <Alert variant="info">
          Bạn chưa có đánh giá nào. Hãy mua truyện và đánh giá trong mục{" "}
          <strong>“Đơn hàng của tôi”</strong>.
        </Alert>
        <Button as={Link} to="/" variant="primary">
          ← Về trang chủ
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="fw-bold mb-3">Đánh giá của tôi</h3>

      {reviews.map((r) => {
        const comic = comicMap[r.comicId];
        return (
          <Card className="mb-3 shadow-sm" key={r.id}>
            <Card.Body className="d-flex">
              {comic?.thumbnailUrl && (
                <div className="me-3">
                  <img
                    src={comic.thumbnailUrl}
                    alt={comic.title}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
                </div>
              )}

              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <Card.Title className="mb-1">
                      {comic?.title || r.comicTitle}
                    </Card.Title>
                    <div className="text-muted small">
                      Ngày đánh giá: {formatDateTime(r.createdAt)}
                    </div>
                  </div>
                  <div className="text-end">
                    <Badge bg="warning" text="dark">
                      {r.rating} ★
                    </Badge>
                  </div>
                </div>

                {r.comment && (
                  <Card.Text className="mt-2">{r.comment}</Card.Text>
                )}

                <div className="d-flex justify-content-between mt-2">
                  <Button
                    as={Link}
                    to={`/comics/${r.comicId}`}
                    variant="outline-primary"
                    size="sm"
                  >
                    Xem truyện
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(r)}
                  >
                    Xóa đánh giá
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        );
      })}

      {/* ✅ Confirm Modal (thay window.confirm, không đổi logic) */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Bạn có chắc muốn xóa đánh giá này không?</p>
          {confirmReview && (
            <div className="small text-muted">
              <div>
                <b>Truyện:</b>{" "}
                {comicMap[confirmReview.comicId]?.title || confirmReview.comicTitle}
              </div>
              <div>
                <b>Rating:</b> {confirmReview.rating}★
              </div>
              {confirmReview.comment && (
                <div className="mt-1">
                  <b>Bình luận:</b> {confirmReview.comment}
                </div>
              )}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowConfirm(false);
              setConfirmReview(null);
            }}
          >
            Hủy
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default MyReviewsPage;
