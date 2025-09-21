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