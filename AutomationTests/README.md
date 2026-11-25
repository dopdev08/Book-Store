# Kiểm thử tự động TruyenHub

![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![Selenium](https://img.shields.io/badge/Selenium-4-43B02A?logo=selenium&logoColor=white)
![TestNG](https://img.shields.io/badge/TestNG-7-FF6C37)
![REST Assured](https://img.shields.io/badge/REST_Assured-5-4CAF50)

Test API và UI cho web bán truyện [TruyenHub](../README.md).

| Nội dung | Số lượng |
|---|---|
| Test case | 20 ([test-cases.md](docs/test-cases.md)) |
| Test tự động | 18: 12 API, 6 UI |
| Lỗi tìm được | 5, trong đó 2 Critical ([bug-reports.md](docs/bug-reports.md)) |

## Phạm vi

| Nhóm | API | UI | Thủ công |
|---|---|---|---|
| Đăng ký, đăng nhập | 4 | 2 | – |
| Phân quyền | 3 | 1 | – |
| Danh mục, giỏ hàng | 1 | 2 | – |
| Đặt hàng | 3 | 1 | – |
| Mã giảm giá | 1 | – | 1 |
| Quản trị | – | – | 1 |
| **Tổng** | **12** | **6** | **2** |

## Cách chạy

1. Bật database, backend và frontend theo [README gốc](../README.md#chạy-trên-máy). Máy cần có Chrome.
2. Mở PowerShell trong thư mục `AutomationTests`:

| Mục đích | Lệnh |
|---|---|
| 15 test hồi quy, phải xanh | `..\BackendHub\mvnw.cmd test` |
| Như trên, không hiện cửa sổ Chrome | `..\BackendHub\mvnw.cmd test "-Dheadless=true"` |
| 3 test của lỗi chưa sửa, đang đỏ | `..\BackendHub\mvnw.cmd test "-Dsuite=testng-known-bugs.xml"` |

Kết quả lần chạy 26/11/2026:

```text
[INFO] Tests run: 15, Failures: 0, Errors: 0, Skipped: 0
```

Báo cáo nằm ở `target/surefire-reports/index.html`, ảnh của test UI bị đỏ ở `target/screenshots`.

## Cấu trúc

```text
AutomationTests/
├── testng.xml               15 test hồi quy
├── testng-known-bugs.xml    3 test của lỗi chưa sửa
├── docs/                    test case, báo cáo lỗi
└── src/test/java/com/truyenhub/
    ├── core/    Api (gọi API), TestData (tạo dữ liệu)
    ├── pages/   Page Object, mỗi trang một class
    ├── api/     test API
    └── ui/      test giao diện
```

## Cách thiết kế

- **Dữ liệu độc lập:** mỗi test tự tạo khách, truyện và mã giảm giá qua API nên chạy lại nhiều lần được.
- **Page Object Model:** locator chỉ nằm trong `pages`, test chỉ mô tả thao tác và kết quả.
- **Explicit wait:** chờ đúng điều kiện bằng `WebDriverWait`, không dùng `Thread.sleep`.
- **Assert theo hành vi đúng:** lỗi chưa sửa nằm riêng ở `KnownBugsTest` và để đỏ, không sửa assert cho xanh.
- **Kiểm thử đồng thời:** `KnownBugsTest` gửi 8 đơn hàng cùng lúc để kiểm tra bán vượt tồn kho.
- **Bằng chứng khi đỏ:** test UI tự chụp màn hình.
