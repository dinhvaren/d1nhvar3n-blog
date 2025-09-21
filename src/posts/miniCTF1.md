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

Tôi thấy rõ ràng có các giá trị như sau:

```jwt
Set-Cookie: PHPSESSID=9c0b94ce3efef5f2ce62ef39b15ecd0c;
Set-Cookie: user=dinhvaren;
Set-Cookie: role=user;
```
Ngay lúc đó, tôi biết: trò chơi này là **cookie tampering**.

---

## 3. Giải mã bánh quy (JWT decoding)

Tôi mở tab **Application → Cookies** trong DevTools để quan sát.  
Ở đó, ba chiếc bánh quy nhỏ nằm ngay ngắn: `PHPSESSID`, `user`, và `role`.  

![Burp Suite Cookies](images/04_cookies.png)

```
PHPSESSID = 9c0b94ce3efef5f2ce62ef39b15ecd0c;
user = dinhvaren;  
role: = user;  
```
Có một khoảnh khắc im lặng — `role` là `user`. Tôi mỉm cười nhẹ: *"Nếu bánh quy ở trong kho nhà admin, thì ta phải trở thành admin."*
## 4. Trò nghịch cookie (Tampering)

Tôi thử chỉnh giá trị cookie `role`.  
Thay `user`, tôi đổi nó thành `admin`.  

Trong Burp Repeater, tôi sửa trực tiếp:  


```
Cookie: PHPSESSID=9c0b94ce3efef5f2ce62ef39b15ecd0c;
user=dinhvaren;
role=admin
```
![Repeater Request](images/06_repeater_response.png)

Tim tôi đập nhanh khi nhấn **Go** gửi request mới.

---


## 5. Khám phá kho báu (Flag)

Server trả về trang — và trong body, như một kho báu được mở nắp, dòng chữ kia hiện ra rõ ràng:
![Flag page](images/07_flag.png)

Chiếc bánh quy ngọt ngào đã thuộc về Oguri Cap.  
Tôi lưu lại Burp request/response và ảnh cookie như minh chứng cho hành trình này.

## 6. Kết thúc câu chuyện

Chiếc bánh quy cuối cùng cũng xuất hiện dưới dạng flag.  
Tôi dựa lưng vào ghế, thở phào: một thử thách 500 điểm đã hạ gục.

Từ một trang login tưởng chừng vô hại, tôi lần theo dấu vết cookie, phát hiện server **tin tưởng role do client gửi lên**, và chỉ bằng cách sửa một giá trị nhỏ, tôi đã leo quyền thành admin để tìm ra bí mật ẩn sau.  

**Bài học rút ra từ câu chuyện này:**
- Đừng bao giờ tin dữ liệu do client gửi lên.  
- Không nên lưu trực tiếp role/permission trong cookie.  
- Nếu cần, hãy lưu role ở server-side session, không để client chỉnh được.  
- Cookie nên có thêm flag `HttpOnly`, `Secure`, `SameSite`.

Trong đời thực, một lỗi nhỏ thế này có thể khiến toàn bộ hệ thống bị chiếm quyền.  
Nhưng trong cuộc chơi CTF, nó chỉ đem lại cho tôi một **chiếc bánh quy ngọt ngào mang tên flag**:
```
miniCTF{Sup3r_4ssm1n}
```

