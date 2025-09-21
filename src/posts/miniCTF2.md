
# The Queen's Secret (Web - 500 pts)

> Một write-up cho challenge Web tại miniCTF, kể lại hành trình tìm “bánh quy” bị thất lạc.  
> Chủ đề: Cookie tampering, privilege escalation.

## Table of Contents
- [1. Màn mở đầu — một lời mời của Mad Hatter](#1-màn-mở-đầu--một-lời-mời-của-mad-hatter)
- [2. Thăm dò & thử nhập (Recon / First touch)](#2-thăm-dò--thử-nhập-recon--first-touch)
- [3. Quan sát HTTP (Burp → HTTP history)](#3-quan-sát-http-burp-→-http-history)
- [4. Đánh giá giả thuyết & nghịch cookie (Tampering)](#4-đánh-giá-giả-thuyết--nghịch-cookie-tampering)
- [5. Kết quả — Khu vực bí mật hé lộ (Flag)](#5-kết-quả--khu-vực-bí-mật-hé-lộ-flag)
- [6. Tái hiện (Repro) — từng bước cho bạn làm lại](#6-tái-hiện-repro---từng-bước-cho-bạn-làm-lại)
- [7. Bài học rút ra (Lessons)](#7-bài-học-rút-ra-lessons)
- [Appendix — Evidence & Notes](#appendix---evidence--notes)

## 1. Màn mở đầu — một lời mời của Mad Hatter

Vào một buổi chiều, tôi mở challenge **The Queen's Secret** (500 pts). Giao diện chào đón rất chỉn chu: tiêu đề to, gradient nền bắt mắt, một đoạn dẫn truyện và một ô nhập tên. Mad Hatter đứng giữa, nháy mắt và nói:

> “Nhập tên ngươi vào, ta sẽ cho ngươi thấy điều kỳ diệu.”

Cảm giác ban đầu: giao diện đẹp nhưng “im lặng” — và trong CTF, im lặng nhiều khi là dấu hiệu của điều ẩn giấu.

![cover placeholder](/images/miniCTF/TheQueenSecret/dashboard.png)

## 2. Thăm dò & thử nhập (Recon / First touch)

Tôi không lao ngay vào payload mạnh. Trước hết:

- Mở DevTools để xem DOM / JS.
- Bật Burp Suite Proxy để bắt traffic.
- Nhập thử `test` và bấm **Gửi cho Mad Hatter**.

![test placeholder](/images/miniCTF/TheQueenSecret/sendtest.png)

Kết quả: trang hiển thị một lời chào đơn giản trong phần “Lời chào từ Mad Hatter”, không có flag hay thay đổi rõ rệt.

> Ghi chú: lúc này ta chưa thấy token, id, hay endpoint đặc biệt — chỉ có request đơn giản khi tải trang / submit.

## 3. Quan sát HTTP (Burp → HTTP history)

Mục tiêu tiếp theo là quan sát request/response khi load trang. Mở **Burp → Proxy → HTTP history** và xem request GET `/` (hoặc request submit).

Ở đây có 1 chi tiết rất đáng chú ý trong header:
```
Cookie: queen=false
```

Tôi chụp ảnh màn hình HTTP history để lưu evidence.

![burp-http-history-placeholder](/images/miniCTF/TheQueenSecret/requestindex.png)

> Nhận xét: Một cookie boolean `queen=false` xuất hiện. Rõ ràng đây là giá trị client-side. Nếu server dùng cookie này để quyết định hiển thị khu vực "bí mật", thì việc chỉnh cookie có khả năng thay đổi UI/behavior.

## 4. Đánh giá giả thuyết & nghịch cookie (Tampering)

Giả thuyết: `queen=false` → không được xem khu vực bí mật; `queen=true` → được xem.

Chiến lược an toàn để kiểm tra:

1. Copy request GET `/` (hoặc request submit nếu submit thay đổi session) vào **Burp Repeater**.  
2. Sửa header Cookie từ `queen=false` → `queen=true`.  
3. Gửi request đã chỉnh (Send) trong Repeater.  
4. Quay về trình duyệt (vẫn đi qua Burp) → bấm **Gửi cho Mad Hatter** một lần nữa.

**Request before (burp history):**
```
GET / HTTP/1.1
Host: 103.249.117.57:6636
Cookie: queen=false
```
**Request after (repeater):**
```
GET / HTTP/1.1
Host: 103.249.117.57:6636
Cookie: queen=true
```
![burp-repeater-placeholder](/images/miniCTF/TheQueenSecret/repeatcher.png)

## 5. Kết quả — Khu vực bí mật hé lộ (Flag)

Sau khi chỉnh cookie và bấm submit lại, phần nội dung trên trang thay đổi tức thì: một khung “Khu vực bí mật của Heart Queen” xuất hiện, và giữa đó — **flag**:
```
miniCTF{411c3_1n_W0nd3rl4nd}
```
Tôi chụp ảnh trang hiển thị flag làm chứng.

![flag-placeholder](/images/miniCTF/TheQueenSecret/flag.png)

Cảm giác lúc đó — giống như vừa mở kho báu: đơn giản, ngọt ngào, và rất thuyết phục.

## 6. Tái hiện (Repro) — từng bước cho bạn làm lại

Dưới đây là các bước cụ thể để ai cũng có thể tái hiện:

1. Mở trình duyệt tới: `http://103.249.117.57:6636/`.  
2. Mở Burp Suite → Proxy → Intercept (hoặc HTTP history).  
3. Nhập một tên ví dụ `test` và bấm **Gửi cho Mad Hatter** (lưu ý bắt request khi load trang/submit).  
4. Trong Burp → HTTP history, tìm request GET `/` (hoặc request submit). Quan sát header `Cookie: queen=false`.  
5. Click phải → Send to Repeater.  
6. Trong Repeater, sửa header cookie thành `Cookie: queen=true`.  
7. Send request đã sửa. (Bạn có thể copy-response nếu cần.)  
8. Quay về tab trình duyệt (đi qua Burp) và bấm **Gửi cho Mad Hatter** lần nữa.  
9. Quan sát phần “Khu vực bí mật” hiển thị flag. Lưu screenshot trang + request/response trong Burp.

## 7. Bài học rút ra (Lessons)

- **Không bao giờ tin dữ liệu client-side.** Cookie, localStorage, URL params, form fields — tất cả đều có thể bị chỉnh sửa bởi attacker.  
- **Không dùng client-side flag/boolean để kiểm soát quyền truy cập**. Mọi quyết định phân quyền phải có xác thực server-side.  
- **Kiểm tra kỹ mọi chỗ hiển thị logic “đặc quyền”** — đôi khi dev chỉ muốn ẩn UI cho UX và quên enforce server check.  
- **Trong CTF, đừng bỏ qua những thứ nhỏ** — đôi khi flag nằm ở chỗ rất nhỏ như một cookie boolean.

## Appendix — Evidence & Notes

- Burp HTTP history (screenshot) — ghi chú: `Cookie: queen=false`.  
- Burp Repeater request (screenshot) — `Cookie: queen=true`.  
- Trang hiển thị flag (screenshot).  
- Flag: `miniCTF{411c3_1n_W0nd3rl4nd}`. 

**Kết** — Một câu chuyện ngắn: từ giao diện tĩnh đến kho báu — chỉ bằng một lần nghịch cookie, Alice bước vào vương quốc Heart Queen.  