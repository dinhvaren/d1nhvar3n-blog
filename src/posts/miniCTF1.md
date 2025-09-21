# Super Cookie (Web - 500 pts)

> Một write-up cho challenge Web tại miniCTF, kể lại hành trình tìm “bánh quy” bị thất lạc.
> Chủ đề: Cookie, JWT tampering, privilege escalation.

---

## Table of Contents
- [1. Câu chuyện bắt đầu](#1-câu-chuyện-bắt-đầu)
- [2. Bước vào mê cung (Recon)](#2-bước-vào-mê-cung-recon)
- [3. Giải mã bánh quy (JWT decoding)](#3-giải-mã-bánh-quy-jwt-decoding)
- [4. Trò nghịch cookie (Tampering)](#4-trò-nghịch-cookie-tampering)
- [5. Khám phá kho báu (Flag)](#5-khám-phá-kho-báu-flag)
- [6. Kết thúc câu chuyện](#6-kết-thúc-câu-chuyện)
- [Appendix — Quick Steps](#appendix--quick-steps)

## 1. Câu chuyện bắt đầu

Một buổi chiều mưa, tôi mở đề CTF: **Super Cookie**.  
Điểm số 500 — khá cao, chắc hẳn không dễ dàng.

> **Đề bài:**  
> "Oguri Cap đang đi tập luyện trên đường nhưng vô tình rơi vào thế giới VulnderLand.  
> Do liên tục chạy trong nhiều giây, dần dần cô ấy cảm thấy đói và thèm bánh quy.  
> Bạn hãy giúp cô ấy tìm được bánh quy để tiếp tục chạy nhé!"

Bánh quy? 🤔 Ở thế giới web thì chỉ có **cookie** mới là bánh quy quan trọng nhất.  
Vậy flag chắc chắn sẽ liên quan đến cookie!

---

## 2. Bước vào mê cung (Recon)

Tôi mở trình duyệt, truy cập vào `http://103.249.117.57:4999/login.php`.  
Một trang đăng nhập hiện ra, khá đơn giản. Không có gì đặc biệt ở giao diện.  

![Login page](images/01_login.png)

Trong đầu vang lên suy nghĩ: *“Đã là CTF thì form login hiếm khi để brute-force. Chắc chắn có trick ở cookie/session.”*  

Tôi bật **Burp Suite**, bật intercept và thử gửi request khi bấm login.  
Kết quả: server trả về một **cookie lạ**.

![Burp Intercept](images/03_burp_intercept.png)

Tôi copy giá trị cookie ra giấy nháp, thấy nó có dạng quen thuộc:  

```jwt
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Trong đầu tôi lóe lên: *“JWT. Chắc chắn là JWT.”*  

---

## 3. Giải mã bánh quy (JWT decoding)

Như một thám tử đang lần theo dấu vết, tôi copy toàn bộ token,tôi đem token này lên [jwt.io](https://jwt.io/) mở jwt.io như mở một chiếc hộp bí mật, và dán token vào. Payload hiện ra trước mắt, giản dị nhưng đầy ý nghĩa.

Ngay lập tức, payload được decode:  

```json
{
  "user": "guest",
  "role": "user"
}
```
Có một khoảnh khắc im lặng — `role` là `user`. Tôi mỉm cười nhẹ: *"Nếu bánh quy ở trong kho nhà admin, thì ta phải trở thành admin."*
## 4. Trò nghịch cookie (Tampering)

Tôi sửa payload trên jwt.io, thay `role` thành `admin`:

```json
{
  "user": "guest",
  "role": "admin"
}
```
jwt.io sinh ra một token mới. Trên góc tâm trí tôi biết: nếu server kiểm tra signature nghiêm ngặt thì trò này sẽ dừng lại ở đó. Nhưng nhiều challenge thiết kế để dạy bài học — đôi khi server lười kiểm tra alg hoặc để lộ secret. Tôi quyết định liều một nước.

Quay lại Burp, đưa request vào Repeater, tìm chỗ cookie `auth=` rồi dán token mới vào. Tim tôi đập nhanh khi nhấn Go.
---

## 5. Khám phá kho báu (Flag)

Server trả về trang — và trong body, như một kho báu được mở nắp, dòng chữ kia hiện ra rõ ràng:
```
miniCTF{super_cookie_master}
```
Tôi bật cười: chiếc bánh quy ngọt ngào đã thuộc về Oguri Cap. Tôi chụp ảnh màn hình response, lưu lại Burp request/response và snapshot của jwt.io — bằng chứng cho hành trình khám phá này.

## 6. Kết thúc câu chuyện

Chiếc bánh quy cuối cùng cũng xuất hiện dưới dạng flag.  
Tôi dựa lưng vào ghế, thở phào: một thử thách 500 điểm đã hạ gục.

Từ một trang login tưởng chừng vô hại, tôi lần theo dấu vết cookie, mở khóa JWT, nghịch payload để leo quyền thành admin, và tìm ra bí mật ẩn sau.  

**Bài học rút ra từ câu chuyện này:**
- Đừng bao giờ tin tưởng dữ liệu do client gửi lên.  
- Với JWT, luôn phải **kiểm tra chữ ký** (signature), không được để `alg: none` hoặc bỏ qua verify.  
- Không nên lưu role/permission trong cookie mà không có integrity check.  
- Cookie nên được cấu hình thêm `HttpOnly`, `Secure`, `SameSite` để giảm rủi ro tấn công.  

Trong đời thực, một lỗi nhỏ trong xác thực có thể dẫn đến việc kẻ tấn công chiếm quyền điều khiển hệ thống.  
Nhưng trong cuộc chơi CTF này, nó chỉ đem đến cho tôi một **chiếc bánh quy ngọt ngào mang tên flag**:

