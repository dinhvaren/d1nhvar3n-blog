# Super Cookie (Web - 500 pts)

> Một write-up cho challenge Web tại miniCTF, kể lại hành trình tìm “bánh quy” bị thất lạc.  
> Chủ đề: Cookie tampering, privilege escalation.

## Table of Contents
- [1. Câu chuyện bắt đầu](#1-câu-chuyện-bắt-đầu)
- [2. Bước vào mê cung (Recon)](#2-bước-vào-mê-cung-recon)
- [3. Giải mã bánh quy (Cookie decoding)](#3-giải-mã-bánh-quy-cookie-decoding)
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

Bánh quy? 🤔 Ở thế giới web thì chỉ có **cookie** là chiếc bánh quy quan trọng nhất.  
Vậy flag rất có khả năng liên quan đến cookie hoặc session.

## 2. Bước vào mê cung (Recon)

Tôi mở trình duyệt, truy cập vào `http://103.249.117.57:4999/login.php`.  
Một trang đăng ký / đăng nhập hiện ra, khá đơn giản. Không có gì đặc biệt ở giao diện.  

![Login page](/images/miniCTF/login.png)

Trong đầu vang lên suy nghĩ: *“Đã là CTF thì form login hiếm khi để brute-force. Chắc chắn có trick ở cookie/session.”*  
Bắt đầu tôi thử **đăng ký** tài khoản: `username = dinhvaren`, `password = 1234`. Sau khi đăng ký xong, tôi đăng nhập bằng tài khoản đó.

![Signup page](/images/miniCTF/signup.png)

Tiếp theo tôi bật **Burp Suite** và bắt gói tin khi submit request đăng nhập. Server trả về một số cookie trong response — điều này khiến tôi chú ý.

![Burp Intercept](/images/miniCTF/postLogin.png)

Trong phần `Set-Cookie` tôi thấy:

```
Set-Cookie: PHPSESSID=9c0b94ce3efef5f2ce62ef39b15ecd0c;
Set-Cookie: user=dinhvaren;
Set-Cookie: role=user;
```
Cú nhìn đầu tiên đã gợi ý: đây có thể là **cookie tampering** — server tin vào giá trị `role` do client cung cấp.


## 3. Giải mã bánh quy (cookie decoding)

Tôi mở Burp → **Proxy → HTTP history** hoặc DevTools → Application → Cookies để quan sát rõ hơn. Ba mục cookie hiện ra: `PHPSESSID`, `user`, và `role`.

![Burp Suite Cookies](/images/miniCTF/cookie.png)

Các giá trị hiện như sau:
```
PHPSESSID = 9c0b94ce3efef5f2ce62ef39b15ecd0c;
user = dinhvaren;  
role: = user;  
```

Có một khoảnh khắc im lặng — `role` là `user`. Tôi mỉm cười nhẹ: *"Nếu bánh quy ở trong kho nhà admin, thì ta phải trở thành admin."*
## 4. Trò nghịch cookie (Tampering)

Ý nghĩ đơn giản hiện lên: sửa cookie `role` từ `user` thành `admin` để xem server phản ứng thế nào.

Trong Burp Repeater, tôi chỉnh cookie thành:  
```
Cookie: PHPSESSID=9c0b94ce3efef5f2ce62ef39b15ecd0c;
user=dinhvaren;
role=admin
```
![Repeater Request](/images/miniCTF/setAdmin.png)

Tim tôi đập nhanh khi nhấn **Go** gửi request mới.
Ồ có vẻ như không thấy gì sau khi tôi đã sửa `role` thành `admin` cả, ngay lúc này trong đầu tôi suy nghĩ rằng có thể có 1 đường dẫn nào đó trong source code, tôi liền kiểm tra `index.php`.

![Response index.php](/images/miniCTF/checkIndex.png)

Sau khi gửi request, ban đầu không thấy gì thay đổi trên trang index. Tôi nghi ngờ có thể flag nằm ở một endpoint ẩn, nên quyết định dò thêm các đường dẫn tiềm năng.
Tôi dùng `ffuf` nhẹ để fuzz các file/endpoint phổ biến — không quét mạnh, chỉ vài từ khóa ngắn:

![Ffuf admin.php](/images/miniCTF/Fuzz.png)

Kết quả cho thấy tồn tại `admin.php`. Tôi truy cập `/admin.php` bằng Burp để xem response.

![Response admin.php](/images/miniCTF/requestAdmin.png)

Trang `/admin.php` không hiển thị flag trực tiếp nhưng trong nội dung trả về có gợi ý về một endpoint khác: `flag.php`. Tôi truy cập ngay `/flag.php`.

## 5. Khám phá kho báu (Flag)

Server trả về trang chứa flag — đúng như mong đợi, chiếc bánh quy đã lộ ra:

![Flag page](/images/miniCTF/CTF.png)

Chiếc bánh quy ngọt ngào đã thuộc về Oguri Cap.  
Tôi lưu lại ảnh chụp màn hình (Burp request/response, DevTools cookie, trang flag) làm bằng chứng cho hành trình này.

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

## Appendix — Quick Steps

1. Đăng ký / Login → Burp Intercept → xem các cookie được set (`user`, `role`).  
2. Phát hiện `role=user`.  
3. Sửa cookie thành `role=admin`.  
4. Dò endpoint (ví dụ dùng ffuf nhẹ) → tìm `admin.php` → từ đó truy cập `flag.php`.  
5. Copy flag và lưu bằng chứng (screenshots, request/response).