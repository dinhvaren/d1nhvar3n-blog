# CBJS Lab — Musoe (Buy-the-Flag)

**Write-up**

> Một chuyến ghé thăm _Musoe_ — nơi mọi thứ có thể được mua bán, kể cả những điều kỳ quặc nhất.  
> Chủ đề: lỗi logic cửa hàng (client-trust), tampering request, checkout → mua được flag.

## Table of Contents

- [1. Câu chuyện bắt đầu](#1-câu-chuyện-bắt-đầu)
- [2. Thăm dò ngôi làng (Recon)](#2-thăm-dò-ngôi-làng-recon)
- [3. Cửa hàng bí mật (Analysis)](#3-cửa-hàng-bí-mật-analysis)
- [4. Trò nghịch ngợm (Tampering)](#4-trò-nghịch-ngộm-tampering)
- [5. Thanh toán và nhận kho báu (Exploitation)](#5-thanh-toán-và-nhận-kho-báu-exploitation)
- [6. Kết thúc câu chuyện (Conclusion)](#6-kết-thúc-câu-chuyện-conclusion)
- [Appendix — Requests & Notes](#appendix--requests--notes)

## 1. Câu chuyện bắt đầu

Một đêm lang thang trong thế giới CTF, mình mở bản đồ và thấy một lab tên **Musoe** thuộc hệ thống _CyberJutsu Lab_. Có một hint: **“flag can be bought in the shop.”**

Ý nghĩ đầu tiên: _Ai lại bán flag công khai?_ Nhưng một hint là hint — mình quyết định đi thử.
Mình truy cập:

```
https://musoe.cyberjutsu-lab.tech/
```

Mình đăng ký và đăng nhập (username `dinhvaren`, password `test`) để truy cập giao diện shop.

![Login form](/images/Cyberjutsu/musoe1/loginPage.png)

## 2. Thăm dò ngôi làng (Recon)

Giao diện hiện ra giống một cửa hàng nhỏ: Home, Shop, Cart — nhìn rất bình thường.

Mình click vào **Shop** và thấy danh sách mặt hàng cùng giá tiền. có item `Flag` với giá lớn (9999). Mình bật Burp Suite để xem các request/response.

![Shop UI + Flag card](/images/Cyberjutsu/musoe1/dashboard.png)

Trong `HTTP history` ta bắt được `GET /api/v2/products` trả về JSON chứa tất cả sản phẩm (mỗi object có `id`, `name`, `price`, ...). Đây là nguồn để biết `id` của `Flag`.

![GET /api/v2/products response](/images/Cyberjutsu/musoe1/getproducts.png)

## 3. Cửa hàng bí mật (Analysis)

Mình thử mua 1 sản phẩm bình thường (Whiskers) từ UI, quan sát request POST tạo order. Mỗi order được gửi đến endpoint `POST /api/v2/orders/create` với body JSON chứa `note` và `product` object.

![Create order - example request/response](/images/Cyberjutsu/musoe1/postorders.png)

Phát hiện quan trọng: server chấp nhận nguyên `product` object từ client (client gửi `id`, `price`, `description` trong body). Điều này có nghĩa server **dùng dữ liệu client gửi làm nguồn xác thực cho order**, thay vì lookup `price` từ DB theo `product.id`.

Điều đáng chú ý: **giá (price)** được gửi từ client. Server dường như tin dữ liệu client gửi về giá cả.
Trong đầu mình lóe lên một ý: _nếu server chấp nhận giá do client gửi, liệu mình có thể gửi item tùy ý (ví dụ "flag") với giá rẻ không?_

## 4. Trò nghịch ngợm (Tampering)

Ý tưởng tấn công: dùng `GET /api/v2/products` để lấy `id` của item `Flag` (id = 1), sau đó gửi `POST /api/v2/orders/create` với `product.id = 1` nhưng chỉnh `price` = `0` (hoặc bất kỳ giá rẻ), hy vọng server chấp nhận và trả flag trong response.

Mẫu payload mình gửi bằng Burp Repeater / Intercept:

```json
{
  "note": "test",
  "product": {
    "id": 1,
    "price": 0,
    "description": "description"
  }
}
```

![Tampered order request](/images/Cyberjutsu/musoe1/repeatcher.png)

## 5. Thanh toán và nhận kho báu (Exploitation)

Server trả về response chứa flag khi order được xử lý với payload tampered:

![Response with flag](/images/Cyberjutsu/musoe1/flag.png)

**Flag thu được:** 
```
CBJS{ab413281962b76090c0db9051c05d2f2}
```

## 6. Kết thúc câu chuyện (Conclusion)

Mình đã tận dụng được lỗi **client-trust / broken business logic**: server chấp nhận `product` object (bao gồm `price`) trực tiếp từ client khi tạo order. Bằng cách gửi `product.id` tương ứng với `Flag` và chỉnh `price` = 0, server xử lý order và trả flag trong response.

**Bài học rút ra**:
- Không bao giờ tin thông tin tài chính (price, discounts, product status) từ client.  
- Server phải luôn xác thực `product.id` và lookup `price`/`name`/`availability` từ database hoặc nguồn dữ liệu authoritative trước khi tạo order/charge.  
- Các endpoint tạo order cần kiểm tra tính hợp lệ và quyền (authorization) nghiêm ngặt.

## Appendix — Requests & Evidence checklist

- Register / Login screenshots (Hình 1).  
- Shop UI và product list (Hình 2).  
- GET /api/v2/products response (Hình 3) — xác định `id` của Flag.  
- POST /api/v2/orders/create (tampered) request (Hình 5).  
- Response chứa flag (Hình 6).  

**Ghi chú về bảo mật & chia sẻ**: khi public write-up, che hoặc loại bỏ cookie/session hoặc bất kỳ thông tin cá nhân nào trước khi đăng. Giá trị flag có thể là sensitive trong cuộc thi — đăng có cân nhắc theo luật CTF.
