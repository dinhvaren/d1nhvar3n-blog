
## 1. **Broken Access Control**

* Lỗi khi ứng dụng không kiểm soát quyền đúng cách, cho phép user truy cập dữ liệu/chức năng vượt quá quyền hạn.
* Ví dụ: người dùng thường truy cập được trang admin chỉ bằng đổi URL.
* Cách phòng tránh: kiểm tra quyền ở server-side, áp dụng nguyên tắc least privilege.


## 2. **Cryptographic Failures** (trước gọi là Sensitive Data Exposure)

* Lỗi liên quan đến mã hóa, dẫn đến rò rỉ dữ liệu nhạy cảm.
* Ví dụ: lưu mật khẩu dạng plaintext, dùng HTTP thay vì HTTPS.
* Cách phòng tránh: dùng HTTPS, hashing với salt (bcrypt, Argon2), không tự viết thuật toán crypto.


## 3. **Injection**

* Xảy ra khi dữ liệu đầu vào không được lọc, chèn thẳng vào câu lệnh (SQL, NoSQL, OS command…).
* Ví dụ: SQL Injection (`' OR '1'='1`).
* Cách phòng tránh: dùng prepared statement, ORM, validate input.


## 4. **Insecure Design**

* Vấn đề từ giai đoạn thiết kế hệ thống (chưa triển khai nhưng đã nguy hiểm).
* Ví dụ: không có kế hoạch chống brute-force, không thiết kế rate-limit.
* Giải pháp: threat modeling, security-by-design.


## 5. **Security Misconfiguration**

* Lỗi cấu hình không an toàn (nguyên nhân rất phổ biến).
* Ví dụ: bật directory listing, để default account, lộ banner server.
* Cách phòng tránh: hardening, disable default, patching thường xuyên.

## 6. **Vulnerable and Outdated Components**

* Sử dụng thư viện/framework/software lỗi thời chứa lỗ hổng đã biết.
* Ví dụ: dùng jQuery version cũ có XSS.
* Giải pháp: kiểm tra dependency (OWASP Dependency-Check, Snyk), update thường xuyên.


## 7. **Identification and Authentication Failures**

* Lỗi trong xác thực, dẫn đến bypass hoặc chiếm quyền tài khoản.
* Ví dụ: brute-force login, JWT không hết hạn, session ID dự đoán được.
* Cách phòng tránh: MFA, session timeout, rate limiting.

## 8. **Software and Data Integrity Failures**

* Liên quan đến việc không đảm bảo tính toàn vẹn phần mềm/dữ liệu.
* Ví dụ: update từ nguồn không tin cậy, không kiểm tra chữ ký file.
* Giải pháp: dùng ký số, kiểm soát CI/CD pipeline.

## 9. **Security Logging and Monitoring Failures**

* Thiếu log hoặc giám sát, khiến không phát hiện được tấn công.
* Ví dụ: brute-force password mà không bị cảnh báo.
* Cách phòng tránh: log đủ (auth, error), giám sát SIEM/SOC, alert khi có bất thường.

## 10. **Server-Side Request Forgery (SSRF)**

* Attacker ép server gửi request đến domain khác (nội bộ hoặc bên ngoài).
* Ví dụ: attacker nhập URL payload, server gọi nội bộ `http://localhost:8080/admin`.
* Cách phòng tránh: validate URL đầu vào, chặn internal IP, dùng allowlist.
