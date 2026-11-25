# Kiểm thử tự động TruyenHub

Test API và UI cho web bán truyện TruyenHub.

**Công cụ:** Java 21, Maven, TestNG, Selenium WebDriver, REST Assured, Page Object Model.

| | Số lượng |
|---|---|
| Test case | 20 ([test-cases.md](docs/test-cases.md)) |
| Test tự động | 18: 12 API, 6 UI |
| Lỗi tìm được | 5 ([bug-reports.md](docs/bug-reports.md)) |

## Cách chạy

1. Bật database, backend và frontend theo [README gốc](../README.md). Cần có Chrome.
2. Mở PowerShell trong thư mục `AutomationTests`:

```powershell
# 15 test phải xanh
..\BackendHub\mvnw.cmd test

# Không hiện cửa sổ Chrome
..\BackendHub\mvnw.cmd test "-Dheadless=true"

# 3 test của các lỗi chưa sửa (đang đỏ)
..\BackendHub\mvnw.cmd test "-Dsuite=testng-known-bugs.xml"
```

Báo cáo: `target/surefire-reports/index.html`. Ảnh của test UI bị đỏ: `target/screenshots`.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `core` | `Api` gọi API, `TestData` tạo dữ liệu riêng cho từng test |
| `pages` | Page Object, mỗi trang một class |
| `api` | Test API; `KnownBugsTest` chứa lỗi chưa sửa |
| `ui` | Test giao diện |
