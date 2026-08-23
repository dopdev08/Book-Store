// src/pages/AdminComicsPage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Image,
  Spinner,
  Badge,
} from "react-bootstrap";
import { comicApi } from "../api/comicApi";
import { uploadApi } from "../api/uploadApi";

function AdminComicsPage() {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ NEW: search & filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | ACTIVE | INACTIVE

  // modal form
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // form fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [stock, setStock] = useState(0);

  // upload file state
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ PDF preview state
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [uploadingPreview, setUploadingPreview] = useState(false);

  // toggle active loading (per row)
  const [togglingId, setTogglingId] = useState(null);

  // ✅ Confirm modal (NEW) - thay window.confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null);
  // confirmPayload = { type: "toggle", comic, next }

  const loadComics = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await comicApi.getAllAdmin();
      setComics(data || []);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Không tải được danh sách truyện (admin).";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComics();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setAuthor("");
    setDescription("");
    setPrice("");
    setCategoryName("");
    setThumbnailUrl("");
    setStock(0);
    setThumbnailFile(null);
    setUploading(false);

    // ✅ PDF
    setPreviewUrl("");
    setPreviewFile(null);
    setUploadingPreview(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (comic) => {
    setEditingId(comic.id);
    setTitle(comic.title || "");
    setAuthor(comic.author || "");
    setDescription(comic.description || "");
    setPrice(comic.price ?? "");
    setCategoryName(comic.categoryName || "");
    setThumbnailUrl(comic.thumbnailUrl || "");
    setStock(Number(comic.stock ?? 0));
    setThumbnailFile(null);

    // ✅ PDF
    setPreviewUrl(comic.previewUrl || "");
    setPreviewFile(null);

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const handlePreviewFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPreviewFile(e.target.files[0]);
    }
  };

  const handleUploadImage = async () => {
    if (!thumbnailFile) return;
    try {
      setUploading(true);
      setError("");

      const data = await uploadApi.uploadImage(thumbnailFile);
      setThumbnailUrl(data.url);
      setThumbnailFile(null);
    } catch (err) {
      console.error("Upload error:", err.response || err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data ||
        "Upload ảnh thất bại.";

      setError(message);
    } finally {
      setUploading(false);
    }
  };

  // ✅ NEW: Upload PDF riêng giống upload ảnh
  const handleUploadPreview = async () => {
    if (!previewFile) {
      setError("Vui lòng chọn file PDF trước.");
      return;
    }

    // ✅ cần editingId để update previewUrl
    if (!editingId) {
      setError(
        "Vui lòng Lưu truyện trước rồi mới upload PDF đọc thử (chỉ upload khi đang Sửa)."
      );
      return;
    }

    try {
      setUploadingPreview(true);
      setError("");

      const pdf = await uploadApi.uploadPreview(previewFile);
      const url = pdf.url;

      await comicApi.updatePreviewUrl(editingId, url);

      setPreviewUrl(url);
      setPreviewFile(null);

      await loadComics();
    } catch (err) {
      console.error("Upload preview error:", err.response || err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data ||
        "Upload PDF đọc thử thất bại.";

      setError(message);
    } finally {
      setUploadingPreview(false);
    }
  };

  // ✅ Save comic (create/update) + optional upload image (PDF KHÔNG upload trong Lưu nữa)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !price || !categoryName) {
      setError("Tiêu đề, giá và thể loại là bắt buộc.");
      return;
    }

    const stockNum = Math.max(0, Number(stock || 0));

    try {
      setError("");

      // ✅ Nếu có chọn ảnh bìa -> upload luôn khi bấm Lưu
      let finalThumbnailUrl = thumbnailUrl;
      if (thumbnailFile) {
        setUploading(true);
        const img = await uploadApi.uploadImage(thumbnailFile);
        finalThumbnailUrl = img.url;
        setThumbnailUrl(finalThumbnailUrl);
        setThumbnailFile(null);
        setUploading(false);
      }

      const payload = {
        title,
        author,
        description,
        price: Number(price),
        categoryName,
        thumbnailUrl: finalThumbnailUrl,
        stock: stockNum,
        previewUrl: previewUrl || null,
      };

      if (editingId) {
        await comicApi.update(editingId, payload);
      } else {
        await comicApi.create(payload);
      }

      await loadComics();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Lưu truyện thất bại.";
      setError(msg);
    } finally {
      setUploading(false);
      setUploadingPreview(false);
    }
  };

  // ✅ Toggle active: giữ logic chặn stock=0, chỉ thay confirm UI
  const handleToggleActive = (comic) => {
    const next = !comic.active;

    // ✅ chặn mở bán khi stock = 0
    const st = Number(comic.stock ?? 0);
    if (next && st <= 0) {
      setError("Không thể mở bán vì tồn kho = 0. Hãy cập nhật tồn kho trước.");
      return;
    }

    setConfirmPayload({ type: "toggle", comic, next });
    setShowConfirm(true);
  };

  // ✅ Thực thi hành động sau khi user bấm "Xác nhận"
  const handleConfirmAction = async () => {
    if (!confirmPayload) return;

    const { comic, next } = confirmPayload;

    try {
      setError("");

      setTogglingId(comic.id);
      await comicApi.setActive(comic.id, next);

      await loadComics();
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || err.response?.data || "Thao tác thất bại.";
      setError(msg);
    } finally {
      setTogglingId(null);
      setShowConfirm(false);
      setConfirmPayload(null);
    }
  };

  const formatPrice = (p) => {
    const n = Number(p || 0);
    return n.toLocaleString("vi-VN");
  };

  const stockBadge = (st) => {
    const n = Number(st ?? 0);
    if (n <= 0) return <Badge bg="danger">Hết hàng</Badge>;
    if (n <= 5) return <Badge bg="warning">Sắp hết ({n})</Badge>;
    return <Badge bg="info">Còn ({n})</Badge>;
  };

  const sortedComics = useMemo(() => {
    return [...comics].sort((a, b) => {
      const aActive = a.active ? 0 : 1;
      const bActive = b.active ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;

      const aStock = Number(a.stock ?? 0) <= 0 ? 1 : 0;
      const bStock = Number(b.stock ?? 0) <= 0 ? 1 : 0;
      if (aStock !== bStock) return aStock - bStock;

      return (a.id ?? 0) - (b.id ?? 0);
    });
  }, [comics]);

  // ✅ NEW: filter + search (không ảnh hưởng sort)
  const filteredComics = useMemo(() => {
    let list = sortedComics;

    if (statusFilter === "ACTIVE") {
      list = list.filter((c) => c.active);
    } else if (statusFilter === "INACTIVE") {
      list = list.filter((c) => !c.active);
    }

    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((c) => {
      return (
        String(c.id ?? "").includes(q) ||
        (c.title || "").toLowerCase().includes(q) ||
        (c.author || "").toLowerCase().includes(q) ||
        (c.categoryName || "").toLowerCase().includes(q)
      );
    });
  }, [sortedComics, search, statusFilter]);

  return (
    <Container className="mt-4">
      <h2>Quản lý truyện (Admin)</h2>

      {error && (
        <Alert
          variant="danger"
          className="mt-3"
          onClose={() => setError("")}
          dismissible
        >
          {error}
        </Alert>
      )}

      {/* ✅ NEW: Search + Filter bar (không xóa gì cũ, chỉ thay UI khu vực này) */}
      <div className="d-flex justify-content-between align-items-center my-3 gap-2 flex-wrap">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {loading && (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Đang tải danh sách truyện...</span>
            </>
          )}

          <Form.Control
            style={{ width: 280 }}
            placeholder="Tìm ID / tiêu đề / tác giả / thể loại"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Form.Select
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả</option>
            <option value="ACTIVE">Đang bán</option>
            <option value="INACTIVE">Dừng bán</option>
          </Form.Select>

          <Button
            variant="outline-secondary"
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
          >
            Xóa lọc
          </Button>
        </div>

        <Button variant="primary" onClick={handleOpenCreate}>
          + Thêm truyện
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ảnh</th>
            <th>Tiêu đề</th>
            <th>Tác giả</th>
            <th>Thể loại</th>
            <th>Giá</th>
            <th>Tồn kho</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {/* ✅ CHỈ ĐỔI sortedComics -> filteredComics */}
          {filteredComics.map((comic) => {
            const st = Number(comic.stock ?? 0);
            const isOut = st <= 0;

            return (
              <tr key={comic.id} style={{ opacity: comic.active ? 1 : 0.65 }}>
                <td>{comic.id}</td>

                <td style={{ width: "80px", textAlign: "center" }}>
                  {comic.thumbnailUrl ? (
                    <Image
                      src={comic.thumbnailUrl}
                      alt={comic.title}
                      rounded
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span>Không có ảnh</span>
                  )}
                </td>

                <td>{comic.title}</td>
                <td>{comic.author}</td>
                <td>{comic.categoryName}</td>
                <td>{formatPrice(comic.price)} đ</td>

                <td>{stockBadge(comic.stock)}</td>

                <td>
                  {comic.active ? (
                    <Badge bg="success">Đang bán</Badge>
                  ) : (
                    <Badge bg="secondary">Dừng bán</Badge>
                  )}
                  {isOut && (
                    <Badge bg="danger" className="ms-2">
                      0 kho
                    </Badge>
                  )}
                </td>

                <td>
                  <Button
                    variant={comic.active ? "outline-secondary" : "outline-success"}
                    size="sm"
                    className="me-2"
                    onClick={() => handleToggleActive(comic)}
                    disabled={togglingId === comic.id || (!comic.active && isOut)}
                    title={!comic.active && isOut ? "Hết hàng: cập nhật kho trước" : ""}
                  >
                    {togglingId === comic.id
                      ? "Đang xử lý..."
                      : comic.active
                      ? "Dừng bán"
                      : "Mở bán"}
                  </Button>

                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleOpenEdit(comic)}
                  >
                    Sửa
                  </Button>
                </td>
              </tr>
            );
          })}

          {/* ✅ CHỈ ĐỔI comics.length -> filteredComics.length */}
          {filteredComics.length === 0 && !loading && (
            <tr>
              <td colSpan={9} className="text-center">
                Chưa có truyện nào.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal thêm / sửa */}
      <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? "Chỉnh sửa truyện" : "Thêm truyện mới"}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tác giả</Form.Label>
              <Form.Control
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Giá (VNĐ)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </Form.Group>

            {/* stock */}
            <Form.Group className="mb-3">
              <Form.Label>Tồn kho</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
              <div className="text-muted small mt-1">
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Thể loại</Form.Label>
              <Form.Control
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ví dụ: Shonen"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ảnh bìa (Cloudinary)</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
              <Button
                variant="secondary"
                className="mt-2"
                onClick={handleUploadImage}
                disabled={!thumbnailFile || uploading}
                type="button"
              >
                {uploading ? "Đang upload..." : "Upload ảnh"}
              </Button>

              {thumbnailUrl && (
                <div className="mt-3">
                  <div>Xem trước:</div>
                  <Image
                    src={thumbnailUrl}
                    alt="Preview"
                    rounded
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
            </Form.Group>

            {/* ✅ PDF đọc thử: có nút Upload PDF riêng */}
            <Form.Group className="mb-3">
              <Form.Label>PDF đọc thử (Preview)</Form.Label>
              <Form.Control
                type="file"
                accept="application/pdf"
                onChange={handlePreviewFileChange}
              />

              <Button
                variant="secondary"
                className="mt-2"
                type="button"
                onClick={handleUploadPreview}
                disabled={!previewFile || uploadingPreview}
                title={!editingId ? "Hãy Lưu truyện trước rồi upload PDF" : ""}
              >
                {uploadingPreview ? "Đang upload..." : "Upload PDF"}
              </Button>

              <div className="text-muted small mt-1">
                Upload PDF chỉ áp dụng khi đang <b>Sửa</b> (đã có ID). Nếu đang Thêm
                mới, hãy Lưu trước rồi mở lại Sửa để upload.
              </div>

              {previewUrl && (
                <div className="mt-2">
                  <div className="small">Đã có PDF đọc thử:</div>
                  <a href={previewUrl} target="_blank" rel="noreferrer">
                    Mở PDF đọc thử
                  </a>
                </div>
              )}
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} type="button">
              Hủy
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={uploading || uploadingPreview}
              title={uploading || uploadingPreview ? "Đang upload..." : ""}
            >
              {editingId ? "Lưu thay đổi" : "Thêm mới"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ✅ Confirm Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {confirmPayload && (
            <>
              <p>
                {confirmPayload.next
                  ? "Bạn có chắc muốn mở bán truyện:"
                  : "Bạn có chắc muốn dừng bán truyện:"}
              </p>
              <strong>{confirmPayload.comic.title}</strong>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowConfirm(false);
              setConfirmPayload(null);
            }}
          >
            Hủy
          </Button>

          <Button
            variant={confirmPayload?.next ? "success" : "warning"}
            onClick={handleConfirmAction}
            disabled={togglingId === confirmPayload?.comic?.id}
          >
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminComicsPage;
