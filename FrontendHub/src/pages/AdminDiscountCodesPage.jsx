// src/pages/AdminDiscountCodesPage.jsx
import { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Alert,
} from "react-bootstrap";
import { discountCodeApi } from "../api/discountCodeApi";

function AdminDiscountCodesPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ✅ Confirm modal (NEW) - thay window.confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null);
  // confirmPayload = { type: "delete", item }

  // Form fields
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("PERCENT");
  const [scope, setScope] = useState("ORDER_TOTAL");
  const [value, setValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [startAt, setStartAt] = useState(""); // datetime-local: "YYYY-MM-DDTHH:mm"
  const [endAt, setEndAt] = useState("");
  const [publicCode, setPublicCode] = useState(true);
  const [active, setActive] = useState(true);
  const [usageLimit, setUsageLimit] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setCode("");
    setDescription("");
    setType("PERCENT");
    setScope("ORDER_TOTAL");
    setValue("");
    setMaxDiscount("");
    setMinOrderAmount("");
    setStartAt("");
    setEndAt("");
    setPublicCode(true);
    setActive(true);
    setUsageLimit("");
  };

  const loadCodes = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await discountCodeApi.getAll();
      setCodes(data || []);
    } catch (e) {
      console.error("Lỗi tải mã giảm:", e);
      setError("Không thể tải danh sách mã giảm giá.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  // ===================== TIME HELPERS (FIX TIMEZONE) =====================
  const toInputValue = (v) => {
    if (!v) return "";

    if (
      typeof v === "string" &&
      !v.endsWith("Z") &&
      !/[+-]\d{2}:\d{2}$/.test(v)
    ) {
      return v.slice(0, 16);
    }

    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";

    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const toBackendLocalDateTime = (v) => {
    if (!v) return null;
    return v.length === 16 ? `${v}:00` : v;
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setCode(item.code || "");
    setDescription(item.description || "");
    setType(item.type || "PERCENT");
    setScope(item.scope || "ORDER_TOTAL");
    setValue(item.value ?? "");
    setMaxDiscount(item.maxDiscount ?? "");
    setMinOrderAmount(item.minOrderAmount ?? "");

    setPublicCode(
      typeof item.publicVisible === "boolean" ? item.publicVisible : true
    );
    setActive(typeof item.active === "boolean" ? item.active : true);
    setUsageLimit(item.usageLimit ?? "");

    setStartAt(toInputValue(item.startAt));
    setEndAt(toInputValue(item.endAt));

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code || !value) {
      setError("Mã và giá trị giảm là bắt buộc.");
      return;
    }

    const payload = {
      code: code.trim(),
      description,
      type,
      scope,
      value: Number(value),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
      startAt: toBackendLocalDateTime(startAt),
      endAt: toBackendLocalDateTime(endAt),
      publicCode,
      active,
      usageLimit: usageLimit ? Number(usageLimit) : null,
    };

    try {
      setError("");
      if (editingId) {
        await discountCodeApi.update(editingId, payload);
      } else {
        await discountCodeApi.create(payload);
      }
      setShowModal(false);
      await loadCodes();
    } catch (e) {
      console.error("Lỗi lưu mã:", e.response?.data || e.message);
      const msg =
        e.response?.data?.message ||
        e.response?.data ||
        "Không thể lưu mã giảm giá.";
      setError(msg);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await discountCodeApi.toggleActive(item.id, !item.active);
      await loadCodes();
    } catch (e) {
      console.error("Lỗi đổi trạng thái mã:", e.response?.data || e.message);
      setError("Không thể đổi trạng thái mã giảm giá.");
    }
  };

  // ✅ Mở confirm modal cho delete (logic xoá y nguyên, chỉ thay confirm UI)
  const handleDelete = async (item) => {
    setConfirmPayload({ type: "delete", item });
    setShowConfirm(true);
  };

  // ✅ Thực thi delete sau khi bấm "Xác nhận"
  const handleConfirmAction = async () => {
    if (!confirmPayload) return;

    const { item } = confirmPayload;

    try {
      await discountCodeApi.delete(item.id);
      await loadCodes();
    } catch (e) {
      console.error("Lỗi xóa mã:", e.response?.data || e.message);
      setError("Không thể xóa mã giảm giá.");
    } finally {
      setShowConfirm(false);
      setConfirmPayload(null);
    }
  };

  const renderScope = (scope) => {
    switch (scope) {
      case "ORDER_TOTAL":
        return "Tiền hàng";
      case "SHIPPING_FEE":
        return "Phí vận chuyển";
      case "BOTH":
        return "Tất cả";
      default:
        return scope;
    }
  };

  const renderUsage = (item) => {
    const used = item.usedCount ?? 0;
    const limit = item.usageLimit;
    if (limit == null) return `${used} / ∞`;
    return `${used} / ${limit}`;
  };

  const displayTime = (v) => {
    if (!v) return "";
    if (
      typeof v === "string" &&
      !v.endsWith("Z") &&
      !/[+-]\d{2}:\d{2}$/.test(v)
    ) {
      return v.replace("T", " ");
    }
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString("vi-VN");
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">
          Quản lý mã giảm giá {loading ? "(đang tải...)" : ""}
        </h3>
        <Button variant="primary" onClick={handleOpenCreate}>
          + Thêm mã mới
        </Button>
      </div>

      {error && (
        <Alert
          variant="danger"
          onClose={() => setError("")}
          dismissible
          className="mb-3"
        >
          {error}
        </Alert>
      )}

      <Table bordered hover responsive size="sm">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Mô tả</th>
            <th>Loại</th>
            <th>Phạm vi</th>
            <th>Giá trị</th>
            <th>Max giảm</th>
            <th>Min đơn</th>
            <th>Lượt dùng</th>
            <th>Công khai</th>
            <th>Trạng thái</th>
            <th>Thời gian</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((c) => (
            <tr key={c.id}>
              <td className="fw-bold">{c.code}</td>
              <td>{c.description}</td>
              <td>
                <Badge bg={c.type === "PERCENT" ? "info" : "secondary"}>
                  {c.type === "PERCENT" ? "% phần trăm" : "Số tiền cố định"}
                </Badge>
              </td>
              <td>{renderScope(c.scope)}</td>
              <td>{c.value}</td>
              <td>{c.maxDiscount ?? "-"}</td>
              <td>{c.minOrderAmount ?? "-"}</td>
              <td>{renderUsage(c)}</td>
              <td>
                <Badge bg={c.publicVisible ? "success" : "dark"}>
                  {c.publicVisible ? "Công khai" : "Mã kín"}
                </Badge>
              </td>
              <td>
                <Form.Check
                  type="switch"
                  checked={c.active}
                  onChange={() => handleToggleActive(c)}
                  label={c.active ? "Bật" : "Tắt"}
                />
              </td>
              <td style={{ fontSize: "0.8rem" }}>
                {c.startAt && <div>Từ: {displayTime(c.startAt)}</div>}
                {c.endAt && <div>Đến: {displayTime(c.endAt)}</div>}
              </td>
              <td>
                <Button
                  size="sm"
                  variant="warning"
                  className="me-2"
                  onClick={() => handleOpenEdit(c)}
                >
                  Sửa
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(c)}
                >
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
          {codes.length === 0 && (
            <tr>
              <td colSpan={12} className="text-center">
                Chưa có mã giảm giá nào.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal thêm / sửa mã */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá mới"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Mã</Form.Label>
              <Form.Control
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VD: MANGA10"
                disabled={!!editingId}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Loại giảm</Form.Label>
              <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="PERCENT">Giảm theo %</option>
                <option value="FIXED_AMOUNT">Giảm số tiền cố định</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Phạm vi áp dụng</Form.Label>
              <Form.Select value={scope} onChange={(e) => setScope(e.target.value)}>
                <option value="ORDER_TOTAL">Chỉ tiền hàng</option>
                <option value="SHIPPING_FEE">Chỉ phí vận chuyển</option>
                <option value="BOTH">Tiền hàng + phí ship</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>
                Giá trị giảm {type === "PERCENT" ? "(%)" : "(VNĐ – số tiền cố định)"}
              </Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Giảm tối đa (VNĐ, optional)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Đơn tối thiểu (VNĐ, optional)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Giới hạn số lượt dùng (optional)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="VD: 100 (để trống = vô hạn)"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Thời gian bắt đầu (optional)</Form.Label>
              <Form.Control
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Thời gian kết thúc (optional)</Form.Label>
              <Form.Control
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Check
                type="switch"
                id="public-switch"
                label="Mã công khai (hiển thị cho người dùng)"
                checked={publicCode}
                onChange={(e) => setPublicCode(e.target.checked)}
              />
            </Form.Group>

            <Form.Group className="mb-1">
              <Form.Check
                type="switch"
                id="active-switch"
                label="Đang hoạt động"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingId ? "Lưu thay đổi" : "Thêm mới"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ✅ Confirm Modal delete (thay window.confirm, không đổi logic) */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {confirmPayload?.type === "delete" && (
            <>
              <p>Bạn có chắc muốn xóa mã:</p>
              <strong>{confirmPayload.item?.code}</strong>
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

          <Button variant="danger" onClick={handleConfirmAction}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminDiscountCodesPage;
