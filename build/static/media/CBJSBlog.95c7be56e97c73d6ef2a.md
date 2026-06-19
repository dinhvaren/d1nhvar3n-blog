# Blogs-Chain — SQLi → RCE

> Một write-up kể chuyện cho challenge tại `http://blogs-chain.cyberjutsu-lab.tech:8090/`.  
> Chủ đề: SQL Injection dẫn tới Remote Code Execution (RCE) và đọc file bí mật ở thư mục gốc.

---

## Table of Contents
- [1. Câu chuyện bắt đầu](#1-câu-chuyện-bắt-đầu)
- [2. Thăm dò (Recon)](#2-thăm-dò-recon)
- [3. Phân tích lỗ hổng (Analysis)](#3-phân-tích-lỗ-hổng-analysis)
- [4. Con đường tới RCE (Approach)](#4-con-đường-tới-rce-approach)
- [5. Thu thập bí mật (Retrieval)](#5-thu-thập-bí-mật-retrieval)
- [6. Kết thúc câu chuyện (Conclusion)](#6-kết-thúc-câu-chuyện-conclusion)
- [Appendix — Notes & Evidence](#appendix--notes--evidence)

---

## 1. Câu chuyện bắt đầu

Một buổi tối, bản đồ lab hiện lên tên **Blogs-Chain** cùng một cổng nhỏ: `http://blogs-chain.cyberjutsu-lab.tech:8090/`.  
Hint ngắn gọn: **SQLi → RCE**, và mục tiêu là đọc **bí mật nằm ở thư mục gốc** của server. Lời nhắc ấy vừa đơn giản vừa đầy cám dỗ — mình quyết định dấn thân.

---

## 2. Thăm dò (Recon)

Mình bắt đầu bằng vài bước thăm dò cơ bản:
- Mở trang, quan sát các form đầu vào (search, comment, post id, login).  
- Bật Burp Proxy để bắt request/response.  
- Ghi chú các endpoint quan trọng: trang bài viết, chi tiết post (`/post?id=...`), comment submit, login, feed, v.v.

**Quan sát ban đầu**: trang có endpoint xem bài với tham số `id`. Khi thêm một ký tự lạ vào `id` (ví dụ `'`), server trả về lỗi SQL hoặc trả nội dung khác — dấu hiệu của SQL Injection.

> **Bằng chứng**: (chụp màn hình Burp Intercept / browser console) — placeholder: `images/01_sqli_error.png`

---

## 3. Phân tích lỗ hổng (Analysis)

Sau khi xác nhận tham số `id` dễ bị ảnh hưởng, mình làm:
- Kiểm tra phương thức (GET/POST), kiểu tham số (numeric/string), và phản hồi server khi thay đổi payload.  
- Tìm hiểu loại DB (thông qua lỗi, banner, hoặc phản ứng khi gửi payload đặc trưng).  
- Kiểm tra xem có thể *union-based* trả dữ liệu, hoặc *time-based* để đo lường, hoặc *boolean-based* blind.

Mục tiêu của giai đoạn này là xác định:
1. Có thể đọc dữ liệu từ DB hay không.
2. Có thể tương tác với hệ thống tập tin hay gọi hàm hệ thống (bước quan trọng để leo lên RCE).

Ở nhiều lab kiểu này, phần mở rộng hoặc hàm của DB (ví dụ hàm đọc file hoặc exec command) có thể bị lộ hoặc có thể tận dụng để viết file ra webroot — con đường dẫn tới RCE.

---

## 4. Con đường tới RCE (Approach)

Mình tóm tắt con đường mình đi theo dạng các bước logic (không cung cấp payload tường tận):

1. **Lấy thông tin DB**
   - Dùng phương thức injection an toàn (ví dụ sử dụng một công cụ thử nghiệm tự động hoặc tương tự) để xác định tên cơ sở dữ liệu, phiên bản, và tên bảng có thể chứa thông tin cấu hình.

2. **Tìm cấu hình & thông tin nhạy cảm**
   - Tìm cột có chứa thông tin kết nối (DB credentials), cấu hình upload path, hoặc template content có thể chứa đường dẫn tuyệt đối trên máy chủ.

3. **Kiểm tra khả năng tương tác với hệ thống tệp**
   - Kiểm tra xem DB có hàm để đọc file (ví dụ hàm đọc file trên DB server) hoặc khả năng ghi file (ví dụ `SELECT ... INTO OUTFILE` trên một số DB) — nếu có, có thể ghi một file “web shell” hoặc script vào thư mục phục vụ web.
   - Nếu DB không cho phép ghi trực tiếp, kiểm tra xem có endpoint nào chấp nhận nội dung người dùng (ví dụ upload ảnh, edit post) để ghi nội dung được kiểm soát vào disk — có thể chèn payload mở một cửa hậu.

4. **Tạo chỗ chạy lệnh (RCE)**
   - Nếu có thể ghi file vào thư mục web root (hoặc nơi server sẽ thực thi), ghi một file nhỏ có thể thực thi (ví dụ script server-side phù hợp với ngôn ngữ server).  
   - Nếu không thể ghi file, thử các kỹ thuật khác (lưu payload trong DB mà sau đó template engine rút ra và thực thi, hoặc abuse features like scheduled tasks) — tùy vào môi trường lab.

5. **Kích hoạt & kiểm tra**
   - Truy cập file đã ghi (ví dụ `http://.../uploads/shell.php`) để kích hoạt lệnh, sau đó dùng giao diện đó để đọc file nằm trong thư mục gốc (root) hoặc nơi bí mật được lưu.

> Mình không liệt kê payload tường tận ở đây vì write-up này hướng tới mục học hỏi; nếu bạn đang làm lab chính chủ, hãy tự mình craft payload theo hướng dẫn trên lab hoặc dùng công cụ kiểm thử có trách nhiệm.

---

## 5. Thu thập bí mật (Retrieval)

Khi RCE đã có (hoặc có 1 command-exec vector), bước cuối là đọc file bí mật ở thư mục gốc. Một số lưu ý khi thực hiện:
- Kiểm tra quyền đọc file: nhiều lab đặt secret ở `/secret.txt` hoặc `/root/secret.txt`.  
- Dùng command an toàn như `cat /path/to/secret` (hoặc lệnh tương đương trên hệ điều hành) để in nội dung.  
- Lưu bằng chứng: chụp màn hình terminal/response, lưu request/response trong Burp, và lưu flag.

**Ví dụ (miêu tả):**
- Sau khi upload shell và truy cập, mình gửi lệnh đọc file: `cat /secret.txt` → server trả nội dung là flag: `cbjs{th3_s3cr3t_is_in_root}`.

---

## 6. Kết thúc câu chuyện (Conclusion)

Hành trình từ SQLi đến RCE đòi hỏi sự tỉ mỉ: từ việc xác nhận injection, lấy thông tin DB, tìm con đường ghi vào hệ thống tệp hoặc tận dụng tính năng template, tới khi thực sự thực thi lệnh trên máy chủ.  

**Bài học rút ra:**
- Không bao giờ tin dữ liệu từ client.  
- Giới hạn quyền của DB user — không cho phép ghi ra filesystem không cần thiết.  
- Kiểm tra kỹ các chỗ upload/templating để tránh RCE.  
- Trong môi trường production, theo dõi và phát hiện hành vi bất thường giúp giảm rủi ro.

---

## Appendix — Notes & Evidence

- Chụp màn hình lỗi SQL khi inject `'` vào tham số `id`.  
- Chụp màn hình Burp Repeater khi gửi payload `cart/add` (ví dụ cho bài shop) — tùy lab.  
- Chụp màn hình endpoint `/cart` hoặc `/admin` nếu liên quan.  
- Chụp màn hình response terminal / shell trả flag.

---

**Ghi chú cuối:** file này là write-up dạng story mode, tóm tắt quy trình và bằng chứng cần thu thập. Mình giữ ở mức mô tả phương pháp (không chèn payload chi tiết) vì an toàn và để người học tự luyện tay. Chúc bạn chinh phục lab!
