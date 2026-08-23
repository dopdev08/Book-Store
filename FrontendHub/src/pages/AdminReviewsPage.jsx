// src/pages/AdminReviewsPage.jsx
import { useEffect, useState } from "react";
import {
  Container,
  Table,
  Spinner,
  Alert,
  Button,
  Badge,
  Modal,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { reviewApi } from "../api/reviewApi";
import { useToast } from "../context/ToastContext";

function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  // ✅ Confirm modal (NEW) - thay window.confirm (không đổi logic xoá)
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmReview, setConfirmReview] = useState(null); // review object

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await reviewApi.getAllAdmin();
        setReviews(data || []);
      } catch (e) {
        console.error("Lỗi tải danh sách đánh giá:", e.response?.data || e);
        setError("Không thể tải danh sách đánh giá.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ✅ mở modal xác nhận
  const handleDelete = (review) => {
    setConfirmReview(review);
    setShowConfirm(true);
  };

  // ✅ thực hiện xoá sau khi confirm
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
        <Alert variant="info">Hiện chưa có đánh giá nào.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="fw-bold mb-3">Quản lý đánh giá</h3>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Truyện</th>
            <th>Người dùng</th>
            <th>Điểm</th>
            <th>Bình luận</th>
            <th>Thời gian</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>
                <Link to={`/comics/${r.comicId}`}>{r.comicTitle}</Link>
              </td>
              <td>{r.username}</td>
              <td>
                <Badge bg="warning" text="dark">
                  {r.rating} ★
                </Badge>
              </td>
              <td style={{ maxWidth: 300 }}>{r.comment}</td>
              <td>{formatDateTime(r.createdAt)}</td>
              <td>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(r)}
                >
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

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
                <b>Truyện:</b> {confirmReview.comicTitle}
              </div>
              <div>
                <b>User:</b> {confirmReview.username} • <b>Rating:</b>{" "}
                {confirmReview.rating}★
              </div>
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

export default AdminReviewsPage;
