// src/pages/AdminReportsPage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Spinner,
  Alert,
  Form,
  Badge,
} from "react-bootstrap";
import { reportApi } from "../api/reportApi";

// ✅ ADD: format yyyy-mm-dd
const pad2 = (n) => String(n).padStart(2, "0");
const toDateInput = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

// ✅ ADD: vì backend đang nhận LocalDate, FE chỉ gửi yyyy-MM-dd
const toLocalDateNoTime = (dateStr) => (dateStr ? String(dateStr) : null);

function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ mặc định 7 ngày gần nhất
  const defaultTo = useMemo(() => new Date(), []);
  const defaultFrom = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d;
  }, []);

  const [fromDate, setFromDate] = useState(toDateInput(defaultFrom));
  const [toDate, setToDate] = useState(toDateInput(defaultTo));

  // data
  const [summary, setSummary] = useState(null);
  const [statusCount, setStatusCount] = useState(null);
  const [revenueDaily, setRevenueDaily] = useState([]);
  const [topComics, setTopComics] = useState([]);

  const from = useMemo(() => toLocalDateNoTime(fromDate), [fromDate]);
  const to = useMemo(() => toLocalDateNoTime(toDate), [toDate]);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");

      const [s1, s2, s3, s4] = await Promise.all([
        reportApi.getSummary({ from, to }),
        reportApi.getOrderStatus({ from, to }),
        reportApi.getRevenueDaily({ from, to }),
        reportApi.getTopComics({ from, to, limit: 10 }),
      ]);

      setSummary(s1 || null);
      setStatusCount(s2 || null);
      setRevenueDaily(s3 || []);
      setTopComics(s4 || []);
    } catch (e) {
      console.error("Load reports error:", e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        "Không thể tải báo cáo.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const money = (v) => Number(v || 0).toLocaleString("vi-VN");

  const badgeStatus = (status) => {
    if (status === "PAID") return <Badge bg="success">PAID</Badge>;
    if (status === "CANCELLED") return <Badge bg="secondary">CANCELLED</Badge>;
    return (
      <Badge bg="warning" text="dark">
        PENDING
      </Badge>
    );
  };

  // ===================== EXPORT CSV (Excel mở được) =====================
  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const csvEscape = (v) => {
    const s = String(v ?? "");
    return `"${s.replaceAll('"', '""')}"`;
  };

  const toCSV = (rows) => rows.map((r) => r.map(csvEscape).join(",")).join("\n");

  const exportCSV = () => {
    const lines = [];

    // Header
    lines.push(["BaoCaoTuNgay", fromDate, "DenNgay", toDate]);
    lines.push([]);

    // Summary section
    lines.push(["=== SUMMARY ==="]);
    lines.push([
      "TongDon",
      "DoanhThuSauGiam",
      "GiamGia",
      "GiamShip",
      "PhiVanChuyen",
      "NguoiMua",
    ]);
    lines.push([
      summary?.totalOrders ?? 0,
      summary?.totalRevenue ?? 0,
      summary?.totalDiscount ?? 0,
      summary?.totalShippingDiscount ?? 0,
      summary?.totalShippingFee ?? 0,
      summary?.uniqueBuyers ?? 0,
    ]);
    lines.push([]);

    // Status section
    lines.push(["=== ORDER STATUS ==="]);
    lines.push(["PENDING", "PAID", "CANCELLED"]);
    lines.push([
      statusCount?.pending ?? statusCount?.PENDING ?? 0,
      statusCount?.paid ?? statusCount?.PAID ?? 0,
      statusCount?.cancelled ?? statusCount?.CANCELLED ?? 0,
    ]);
    lines.push([]);

    // Revenue daily section
    lines.push(["=== REVENUE DAILY ==="]);
    lines.push(["Ngay", "DoanhThu", "SoDon"]);
    (revenueDaily || []).forEach((x) => {
      lines.push([x.date || x.day || "-", x.revenue ?? 0, x.orderCount ?? 0]);
    });
    if ((revenueDaily || []).length === 0) {
      lines.push(["(Khong co du lieu)"]);
    }
    lines.push([]);

    // Top comics section
    lines.push(["=== TOP COMICS ==="]);
    lines.push(["Top", "Truyen", "SoLuongBan"]);
    (topComics || []).forEach((x, idx) => {
      lines.push([
        idx + 1,
        x.title || x.comicTitle || `Comic #${x.comicId}`,
        x.quantitySold ?? 0,
      ]);
    });
    if ((topComics || []).length === 0) {
      lines.push(["(Khong co du lieu)"]);
    }

    const csv = toCSV(lines);
    // thêm BOM để Excel đọc tiếng Việt ổn hơn
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, `reports_${fromDate}_${toDate}.csv`);
  };
  // =====================================================================

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h3 className="fw-bold mb-0">Báo cáo / Thống kê</h3>

        <div className="d-flex gap-2 flex-wrap align-items-end">
          <Form.Group>
            <Form.Label className="small mb-1">Từ ngày</Form.Label>
            <Form.Control
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="small mb-1">Đến ngày</Form.Label>
            <Form.Control
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </Form.Group>

          <Button variant="primary" onClick={loadAll}>
            Xem báo cáo
          </Button>

          <Button
            variant="success"
            onClick={exportCSV}
            disabled={
              (revenueDaily?.length ?? 0) === 0 &&
              (topComics?.length ?? 0) === 0 &&
              !summary &&
              !statusCount
            }
          >
            Xuất Excel (CSV)
          </Button>
        </div>
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

      {/* SUMMARY */}
      <Row className="g-3 mb-3">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted small">Doanh thu (sau giảm)</div>
              <div className="fs-4 fw-bold text-danger">
                {money(summary?.totalRevenue)} đ
              </div>
              <div className="text-muted small">
                Tổng đơn: <b>{summary?.totalOrders ?? 0}</b>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted small">Giảm giá</div>
              <div className="fs-4 fw-bold text-success">
                -{money(summary?.totalDiscount)} đ
              </div>
              <div className="text-muted small">
                Ship giảm: <b>-{money(summary?.totalShippingDiscount)} đ</b>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted small">Phí vận chuyển</div>
              <div className="fs-4 fw-bold">
                {money(summary?.totalShippingFee)} đ
              </div>
              <div className="text-muted small">
                Người mua: <b>{summary?.uniqueBuyers ?? 0}</b>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* STATUS */}
      <Row className="g-3 mb-3">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="fw-bold">Trạng thái đơn hàng</Card.Header>
            <Card.Body>
              <div className="d-flex gap-3 flex-wrap">
                <div>
                  {badgeStatus("PENDING")}{" "}
                  <span className="ms-1">
                    {statusCount?.pending ?? statusCount?.PENDING ?? 0} đơn
                  </span>
                </div>
                <div>
                  {badgeStatus("PAID")}{" "}
                  <span className="ms-1">
                    {statusCount?.paid ?? statusCount?.PAID ?? 0} đơn
                  </span>
                </div>
                <div>
                  {badgeStatus("CANCELLED")}{" "}
                  <span className="ms-1">
                    {statusCount?.cancelled ?? statusCount?.CANCELLED ?? 0} đơn
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* REVENUE DAILY */}
      <Row className="g-3 mb-3">
        <Col md={7}>
          <Card className="shadow-sm">
            <Card.Header className="fw-bold">Doanh thu theo ngày</Card.Header>
            <Card.Body>
              <Table bordered hover responsive size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Doanh thu</th>
                    <th>Số đơn</th>
                  </tr>
                </thead>
                <tbody>
                  {(revenueDaily || []).map((x, idx) => (
                    <tr key={idx}>
                      <td>{x.date || x.day || "-"}</td>
                      <td className="fw-bold text-danger">
                        {money(x.revenue)} đ
                      </td>
                      <td>{x.orderCount ?? 0}</td>
                    </tr>
                  ))}
                  {(revenueDaily || []).length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted">
                        Không có dữ liệu theo ngày.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* TOP COMICS */}
        <Col md={5}>
          <Card className="shadow-sm">
            <Card.Header className="fw-bold">Top truyện bán chạy</Card.Header>
            <Card.Body>
              <Table bordered hover responsive size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Truyện</th>
                    <th>SL</th>
                  </tr>
                </thead>
                <tbody>
                  {(topComics || []).map((x, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{x.title || x.comicTitle || `Comic #${x.comicId}`}</td>
                      <td>{x.quantitySold ?? 0}</td>
                    </tr>
                  ))}
                  {(topComics || []).length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted">
                        Không có dữ liệu top truyện.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminReportsPage;
