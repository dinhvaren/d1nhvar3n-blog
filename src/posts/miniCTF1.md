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
miniCTF{...}
```

> **Mô tả đề bài:**  
> “Oguri Cap đang đi tập luyện trên đường nhưng vô tình rơi vào thế giới VulnderLand.  
> Do liên tục chạy trong nhiều giây, dần dần cô ấy cảm thấy đói và thèm bánh quy.  
> Bạn hãy giúp cô ấy tìm được bánh quy để tiếp tục chạy nhé!”

---

## 2. Phân tích đề (Recon / Analysis)

Mục tiêu của bước này là thu thập tất cả thông tin có thể trước khi thử khai thác.

### 2.1. Mở trang & kiểm tra source
- Mở `http://103.249.117.57:4999/login.php` trong trình duyệt.  
- Mở **DevTools → Elements / Network / Application (Cookies)** để quan sát HTML/JS, các request khi tải trang, và cookie hiện tại.

### 2.2. Quan sát requests / responses
- Bắt traffic bằng **Burp Suite** hoặc dùng **Chrome DevTools → Network**:
  - Xem request khi submit login (method, params, headers, cookies).
  - Xem response set-cookie header (tên cookie, giá trị, attributes `HttpOnly`, `Secure`, `Path`).

### 2.3. Kiểm tra cookie / session
- Tên challenge là *Super Cookie* → rất đáng nghi cookie chứa logic auth (ví dụ `auth`, `session`, `user`, `role`, `token`).
- Các dạng cookie thường gặp:
  - **Base64-encoded JSON** (ví dụ `eyJ1c2VyIjoiYWxpY2UiLCJyb2xlIjoiVVNFUiJ9`).
  - **JWT** (`header.payload.signature`).
  - **PHP serialized** (`a:2:{s:4:"user";s:5:"alice";s:4:"role";s:5:"user";}`).
  - **Signed cookie** (có HMAC / signature).
- Nếu cookie dễ decode/modify (không có signature), ta có thể chỉnh `role` → `admin` hoặc đổi user.

### 2.4. Dò tìm endpoint ẩn
- Dò thêm các file/endpoint phổ biến: `/admin.php`, `/flag`, `/flag.php`, `/download.php?file=...`, `/profile.php`.
- Dò tìm đường link trong HTML/JS (có thể bị ẩn bởi JS).

---

## 3. Khai thác (Exploitation)

Phần này trình bày các phương pháp thử nghiệm theo thứ tự hợp lý, kèm lệnh / payload (có chú thích).

> **Lưu ý bảo mật:** Chỉ thao tác vừa đủ để lấy flag, không thực hiện brute-force hay tấn công làm quá tải server.

### 3.1. Xem cookie đang có (DevTools)
Mở Console → gõ:
```js
document.cookie
```