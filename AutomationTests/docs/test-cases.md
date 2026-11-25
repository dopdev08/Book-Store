# Test case TruyenHub

Môi trường: Windows 11, Chrome, backend và frontend chạy local, MySQL 8.0. Ngày chạy: 2026-11-26.
Kết quả: **15 Pass, 5 Fail** trên 20 case. Mỗi case Fail có một báo cáo trong [bug-reports.md](bug-reports.md).

Tiền điều kiện chung: app đang chạy. "Khách mới" là tài khoản vừa đăng ký, mật khẩu `123456`.

## Đăng ký, đăng nhập

| Mã | Các bước | Dữ liệu | Kết quả mong đợi | Cách chạy | Kết quả |
|---|---|---|---|---|---|
| TC-AUTH-01 | 1. Đăng ký. 2. Đăng nhập | Mật khẩu `abc123` (6 ký tự, biên dưới hợp lệ) | 1. 200. 2. 200 | `AuthApiTest.registerWithSixCharacterPassword` | Pass |
| TC-AUTH-02 | Đăng ký | Mật khẩu `abc12` (5 ký tự, dưới biên) | 400 | `KnownBugsTest.registerWithFiveCharacterPassword` | **Fail** (BUG-03) |
| TC-AUTH-03 | Khách mới đăng nhập | Email và mật khẩu đúng | 200, có token, đúng username, quyền `ROLE_USER` | `AuthApiTest.loginWithValidAccount` | Pass |
| TC-AUTH-04 | Khách mới đăng nhập | Mật khẩu `sai-mat-khau` | 401, "Email hoặc mật khẩu không đúng." | `AuthApiTest.loginWithWrongPassword` | Pass |
| TC-AUTH-05 | 1. Mở `/login`. 2. Nhập email, mật khẩu. 3. Bấm ĐĂNG NHẬP | Đúng | Về trang chủ, navbar hiện tên | `LoginUiTest.loginWithValidAccount` | Pass |
| TC-AUTH-06 | Như TC-AUTH-05 | Mật khẩu `sai-mat-khau` | Hiện thông báo lỗi, vẫn ở `/login` | `LoginUiTest.loginWithWrongPassword` | Pass |

## Phân quyền

| Mã | Các bước | Dữ liệu | Kết quả mong đợi | Cách chạy | Kết quả |
|---|---|---|---|---|---|
| TC-SEC-01 | Gọi `GET /api/cart` | Không có token | 401 hoặc 403 | `SecurityApiTest.cartWithoutToken` | Pass |
| TC-SEC-02 | Gọi `GET /api/admin/users` | Token của khách | 403 | `SecurityApiTest.customerCannotCallAdminApi` | Pass |
| TC-SEC-03 | 1. Khách đăng nhập. 2. Admin khóa tài khoản. 3. Khách gọi `GET /api/users/me` | Token ở bước 1 | 401 hoặc 403 | `KnownBugsTest.lockedAccountCannotUseOldToken` | **Fail** (BUG-02) |
| TC-SEC-04 | 1. Khách đăng nhập. 2. Mở `/admin/comics` | – | Bị đưa về `/login` | `LoginUiTest.customerCannotOpenAdminPage` | Pass |

## Danh mục, giỏ hàng

| Mã | Các bước | Dữ liệu | Kết quả mong đợi | Cách chạy | Kết quả |
|---|---|---|---|---|---|
| TC-CAT-01 | 1. Mở trang chủ. 2. Gõ tên truyện vào ô tìm kiếm | Tên đầy đủ của một truyện | Chỉ hiện truyện đó | `ShoppingUiTest.searchByTitle` | Pass |
| TC-CART-01 | 1. Thêm truyện A. 2. Thêm truyện A lần nữa | Số lượng 1, rồi 2 | Giỏ có 1 dòng, số lượng 3 | `OrderApiTest.addSameComicTwice` | Pass |
| TC-CART-02 | 1. Khách đăng nhập. 2. Tìm truyện, bấm "Thêm vào giỏ". 3. Mở giỏ | Giá 50.000 | Có truyện, tổng 50.000 | `ShoppingUiTest.addComicToCart` | Pass |

## Đặt hàng, mã giảm giá

| Mã | Các bước | Dữ liệu | Kết quả mong đợi | Cách chạy | Kết quả |
|---|---|---|---|---|---|
| TC-ORD-01 | 1. Thêm vào giỏ. 2. Đặt COD, giao FAST | Kho 10, mua 2, giá 50.000 | PENDING, ship 20.000, tổng 120.000, kho còn 8, giỏ trống | `OrderApiTest.orderTwoCopies` | Pass |
| TC-ORD-02 | 1. Thêm vào giỏ. 2. Đặt hàng | Kho 3, mua 4 (vượt biên 1) | Bị từ chối, kho vẫn 3, không có đơn | `OrderApiTest.orderMoreThanStock` | Pass |
| TC-ORD-03 | 8 khách cùng có truyện A trong giỏ và đặt hàng cùng lúc | Kho 1 | Đúng 1 đơn thành công | `KnownBugsTest.onlyOneCustomerCanBuyLastCopy` | **Fail** (BUG-01) |
| TC-ORD-04 | 1. Đăng nhập. 2. Thêm vào giỏ. 3. Thanh toán. 4. Nhập người nhận, bấm "Tiếp tục" | Giá 50.000, COD, giao nhanh | Đơn hiện ở "Đơn hàng của tôi", tổng 70.000 | `ShoppingUiTest.buyWithCod` | Pass |
| TC-DISC-01 | Đặt hàng với mã giảm giá | Đơn 500.000, mã 10% tối đa 30.000 | Giảm 30.000, tổng 490.000 | `OrderApiTest.percentCouponIsCapped` | Pass |
| TC-DISC-02 | 1. Admin tạo mã giảm 15.000 phí ship, đơn tối thiểu 200.000. 2. Khách thêm truyện 250.000. 3. Ở trang thanh toán, nhập mã ship, bấm "Áp dụng". 4. Bấm "Tiếp tục" | Hàng 250.000 | Đặt được, tổng 255.000 | Thủ công | **Fail** (BUG-04) |

## Quản trị

| Mã | Các bước | Dữ liệu | Kết quả mong đợi | Cách chạy | Kết quả |
|---|---|---|---|---|---|
| TC-ADM-01 | 1. Admin dừng bán một truyện còn hàng. 2. Bấm "Sửa", đổi tên, "Lưu thay đổi" | Kho 5 | Tên đổi, trạng thái vẫn "Dừng bán" | Thủ công | **Fail** (BUG-05) |
