# Super Cookie (Web - 500 pts)

## 1. Introduction

**Tên Challenge:** Super Cookie  
**Thể loại:** Web  
**Điểm:** 500  

**Môi trường / Link:**  
[http://103.249.117.57:4999/login.php](http://103.249.117.57:4999/login.php)

**Mục tiêu (Objective):**  
Tìm flag có dạng `miniCTF{...}`

> **Đề bài:**  
> "Oguri Cap đang đi tập luyện trên đường nhưng vô tình rơi vào thế giới VulnderLand.  
> Do liên tục chạy trong nhiều giây, dần dần cô ấy cảm thấy đói và thèm bánh quy.  
> Bạn hãy giúp cô ấy tìm được bánh quy để tiếp tục chạy nhé!"

**Nhận xét ban đầu:**  
- Tên challenge có chữ *Cookie* → nhiều khả năng liên quan đến cookie hoặc session.  
- Entry point là `login.php` → có thể có lỗi logic hoặc kiểm tra cookie sau khi login.  
- Hướng phân tích: xem source HTML, theo dõi request/response, inspect cookie bằng Burp/F12.  

**Flag format:**  
```
miniCTF{FAKE_FLAG_FAKE_FLAG}
```

## 2. Recon / Analysis (Phân tích đề)

Mục tiêu: thu thập thông tin trước khi tấn công.

### 2.1. Mở trang & xem giao diện (screenshot)
- Mở `http://103.249.117.57:4999/login.php` bằng trình duyệt.
- **Chụp màn hình** trang login (screenshot: `images/01_login.png`).

![Screenshot 1 - Login page](images/01_login.png)  
*Hình 1 — Trang login (chụp toàn bộ form và URL bar).*

### 2.2. Kiểm tra source HTML / JS
- Mở DevTools → Elements / Sources để tìm JS có thể set cookie hoặc fetch token.
- **Chụp màn hình** phần code liên quan (screenshot: `images/02_source.png`).

![Screenshot 2 - Page source / JS](images/02_source.png)  
*Hình 2 — Một ví dụ: JS đặt cookie hoặc gọi API trả token.*

### 2.3. Quan sát requests / responses (Proxy)
- Bật Burp Suite (hoặc Chrome DevTools → Network).  
- Intercept request khi submit form login để xem header, body, Set-Cookie, Authorization.
- **Chụp màn hình** Burp Intercept màn request (screenshot: `images/03_burp_intercept.png`).

![Screenshot 3 - Burp intercept request](images/03_burp_intercept.png)  
*Hình 3 — Burp bắt request; chú ý: cookie/token nằm ở header hoặc body.*

### 2.4. Kiểm tra cookie / token
- Mở DevTools → Application → Cookies để xem cookie hiện có (tên + giá trị + attributes).
- Nếu cookie có dạng `header.payload.signature` → có thể là JWT.
- **Chụp màn hình** cookie trong DevTools (screenshot: `images/04_cookies.png`).

![Screenshot 4 - DevTools Cookies](images/04_cookies.png)  
*Hình 4 — Cookie được set (ví dụ tên `auth` chứa JWT).*

### 2.5. Dò tìm endpoints ẩn
- Kiểm tra các đường dẫn phổ biến: `/admin.php`, `/flag`, `/profile.php`, `download.php?file=...`.
- Dùng wget/curl nhẹ để kiểm tra status code các path quan trọng (không scan mạnh).

---

## 3. Exploitation (Khai thác)

Ở ví dụ này ta giả sử token thu được là **JWT** (định dạng `header.payload.signature`) và server có thể chấp nhận token có `alg: none` hoặc server không validate signature chặt.

> **Quan trọng:** các bước dưới đây dùng cho môi trường CTF/peh thử nghiệm. Không dùng trên hệ thống thực tế khi không có phép.

### 3.1. Bắt gói tin với Burp (Hướng dẫn ngắn)
1. Mở Burp → Proxy → Intercept on.  
2. Truy cập `login.php`, submit form để Burp bắt request.  
3. Kiểm tra request/response: tìm `Authorization: Bearer <token>` hoặc `Set-Cookie: auth=<token>` hoặc response JSON `{"token":"..."}`.

**Screenshot hướng dẫn:** dùng file `images/03_burp_intercept.png` làm minh hoạ.

### 3.2. Copy token (JWT) và decode trên jwt.io
1. Mở [jwt.io](https://jwt.io/) (hoặc local tool).  
2. Dán token vào khung Encoded — trang sẽ decode header & payload.  
3. **Chụp màn hình** token + payload trên jwt.io (screenshot: `images/05_jwt_io.png`).

![Screenshot 5 - jwt.io payload edit](images/05_jwt_io.png)  
*Hình 5 — Payload hiện tại (ví dụ `"role": "user"`).*

### 3.3. Chỉnh payload (ví dụ đổi role → admin)
- Thay payload:
```json
{
  "user":"guest",
  "role":"admin"
}

