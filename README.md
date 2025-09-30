# d1nhvar3n-blog

Một mẫu blog cá nhân sử dụng React + Markdown — dễ dàng mở rộng, tùy chỉnh nội dung bằng file `.md`.

## 🔍 Giới thiệu

* Demo: [d1nhvar3n-blog.io.vn](https://d1nhvar3n-blog.io.vn) ([GitHub][1])
* Đây là template blog dùng React (Create React App), styled-components, và nội dung bài viết được viết dưới dạng Markdown. ([GitHub][1])
* Mục đích: để bạn dễ dàng tạo blog cá nhân mà không cần xây dựng từ đầu — chỉ cần viết bài dưới dạng `.md`, cấu hình Posts, và deploy.

## 🧰 Công nghệ sử dụng

* React (Create React App) ([GitHub][1])
* styled-components ([GitHub][1])
* Markdown để viết nội dung bài viết ([GitHub][1])
* Triển khai (deployment): Netlify ([GitHub][1])

## 🚀 Cách chạy project

1. Clone repo:

   ```bash
   git clone https://github.com/dinhvaren/d1nhvar3n-blog.git
   cd d1nhvar3n-blog
   ```

2. Cài dependencies:

   ```bash
   yarn install
   # hoặc nếu dùng npm: npm install
   ```

3. Chạy local:

   ```bash
   yarn start
   # hoặc npm start
   ```

   Sau đó mở `http://localhost:3000` để xem blog của bạn. ([GitHub][1])

## ✍️ Thêm bài viết mới (Markdown)

1. Tạo file Markdown mới: ví dụ `posts/ten-bai-viet.md` ([GitHub][1])
2. Mở file `src/Posts.js`, thêm thông tin bài viết (route, tiêu đề, đường dẫn file `.md`) để blog tự sinh trang cho nó ([GitHub][1])
3. Khởi động lại app (nếu cần) để xem bài viết hiển thị.

## 📂 Cấu trúc thư mục (tóm gọn)

```
d1nhvar3n-blog/
├── public/
├── src/
│   ├── posts/           # chứa các file markdown
│   ├── Posts.js         # quản lý danh sách bài viết & route
│   ├── Data.js           # tùy chỉnh nội dung chung (nếu có)
│   └── …                 # các component React
├── package.json
├── README.md
└── …                      # các file cấu hình khác
```

## 📝 Gợi ý chỉnh sửa & mở rộng

* Bạn có thể thay **theme / style** bằng cách chỉnh styled-components
* Thêm tính năng như comment, tìm kiếm, phân loại, phân trang
* Sử dụng server-side rendering (Next.js) để tối ưu SEO
* Tích hợp CMS headless như Netlify CMS để quản lý bài viết qua giao diện


## 📜 Bản quyền & Giấy phép

© 2025 **Lương Nguyễn Ngọc Đình (d1nhvar3n)**.

Dự án này được phát triển với mục đích **học tập, chia sẻ kiến thức về bảo mật và lập trình web**.
Bạn được phép:

* Fork, chỉnh sửa và sử dụng cho mục đích cá nhân/học tập.
* Trích dẫn hoặc tham khảo mã nguồn, miễn là ghi rõ nguồn **github.com/dinhvaren/d1nhvar3n-blog**.

Không được sử dụng vào mục đích thương mại khi chưa có sự đồng ý bằng văn bản của tác giả.
Miễn là bạn giữ thông tin bản quyền, bạn có thể sử dụng, chỉnh sửa, phân phối miễn phí.