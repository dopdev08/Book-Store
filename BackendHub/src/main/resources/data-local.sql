-- Dữ liệu mẫu cho profile local. INSERT IGNORE: chạy lại không tạo trùng, không ghi đè.
-- Mật khẩu của cả hai tài khoản: 123456
INSERT IGNORE INTO roles (name) VALUES ('ROLE_USER'), ('ROLE_ADMIN');

INSERT IGNORE INTO users (username, email, password, full_name, phone, address, active) VALUES
('admin', 'admin@truyenhub.local', '$2a$10$b.e7u2h0ILz9CVvPAD4aKOkosGB/cQPuaNsGnufFQXCzQGTJHDxOK', 'Quản trị viên', '0900000001', 'Hà Nội', true),
('user',  'user@truyenhub.local',  '$2a$10$b.e7u2h0ILz9CVvPAD4aKOkosGB/cQPuaNsGnufFQXCzQGTJHDxOK', 'Khách hàng',    '0900000002', 'TP.HCM', true);

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r
ON (u.username = 'admin' AND r.name = 'ROLE_ADMIN') OR (u.username = 'user' AND r.name = 'ROLE_USER');

INSERT IGNORE INTO categories (id, name) VALUES (1, 'Hành động'), (2, 'Hài hước'), (3, 'Trinh thám');

INSERT IGNORE INTO comics (id, title, author, description, price, category_id, stock, active) VALUES
(1, 'Kiếm khách thành Nam - Tập 1', 'Nguyễn An',  'Truyện mẫu, còn nhiều hàng', 35000, 1, 100, true),
(2, 'Kiếm khách thành Nam - Tập 2', 'Nguyễn An',  'Truyện mẫu, còn nhiều hàng', 35000, 1, 100, true),
(3, 'Rồng lửa phương Bắc',          'Trần Bình',  'Truyện mẫu, còn nhiều hàng', 50000, 1, 50,  true),
(4, 'Lớp học siêu quậy',            'Lê Chi',     'Truyện mẫu, còn nhiều hàng', 25000, 2, 80,  true),
(5, 'Chú mèo bán phở',              'Lê Chi',     'Truyện mẫu, còn ít hàng',    28000, 2, 5,   true),
(6, 'Vụ án ngõ nhỏ',                'Phạm Dũng',  'Truyện mẫu, chỉ còn 1 cuốn', 60000, 3, 1,   true),
(7, 'Thám tử nửa đêm',              'Phạm Dũng',  'Truyện mẫu, giá cao',        250000, 3, 30, true),
(8, 'Mật mã cuối cùng',             'Phạm Dũng',  'Truyện mẫu, đã ngừng bán',   45000, 3, 0,   false);

INSERT IGNORE INTO discount_codes (id, code, description, type, value, max_discount, min_order_amount, active, scope, usage_limit, used_count, public_visible) VALUES
(1, 'GIAM10',   'Giảm 10%, tối đa 30.000đ',          'PERCENT',      10,    30000, NULL,   true, 'ORDER_TOTAL',  NULL, 0, true),
(2, 'GIAM20K',  'Giảm 20.000đ cho đơn từ 100.000đ',  'FIXED_AMOUNT', 20000, NULL,  100000, true, 'ORDER_TOTAL',  NULL, 0, true),
(3, 'SHIP15K',  'Giảm 15.000đ phí vận chuyển',       'FIXED_AMOUNT', 15000, NULL,  NULL,   true, 'SHIPPING_FEE', NULL, 0, true);
