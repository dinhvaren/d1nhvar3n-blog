import miniCTF1 from "../posts/miniCTF1.md";
import miniCTF2 from "../posts/miniCTF2.md";
import miniCTF3 from "../posts/miniCTF3.md";
import musoe1Lab from "../posts/musoeCBJS.md";
import cbjsblogLab from "../posts/CBJSBlog.md";
import ISPminiCTF from "../assets/img/ispminictf.png";
import ISPminiCTFLogo from "../assets/img/ispminictf2.png";
import CbjsLogo from "../assets/img/cbjs.png";

const Posts = [
  {
    title: "Musoe 01 — Write-up (Cyberjutsu 2025)",
    date: "Sep 17, 2025",
    description:
      "Khám phá cửa hàng ẩn, tận dụng logic mua hàng để lấy được flag. Bao gồm bước phân tích, thử nghiệm và khai thác thành công.",
    image: CbjsLogo,
    content: musoe1Lab,
    route: "cbjs-musoe-01",
  },
  {
    title: "Cbjs Blogs — Write-up (Cyberjutsu 2025)",
    date: "Sep 2, 2025",
    description:
      "Một buổi tối, bản đồ lab hiện lên tên Blogs-Chain cùng một cổng nhỏ: http://blogs-chain.cyberjutsu-lab.tech:8090/. SQLi → RCE, và mục tiêu là đọc 'bí mật nằm ở thư mục gốc của server'.",
    image: CbjsLogo,
    content: cbjsblogLab,
    route: "cbjs-blogs",
  },
  {
    title: "Super Cookie — Write-up (ISP MiniCTF 2025)",
    date: "August 8, 2025",
    description:
      "Bài write-up chi tiết cho thử thách Web 'Super Cookie' (chỉnh sửa cookie & leo thang đặc quyền) — ISP MiniCTF 2025. (500 điểm)",
    image: ISPminiCTF,
    content: miniCTF1,
    route: "super-cookie",
  },
  {
    title: "The Queen's Secret — Write-up (ISP MiniCTF 2025)",
    date: "August 8, 2025",
    description:
      "Bài write-up theo phong cách kể chuyện cho thử thách web 'The Queen's Secret' (tham nhũng cookie → leo quyền). Bao gồm bằng chứng Burp, các bước tái hiện và bài học rút ra. ISP MiniCTF 2025. (500 điểm)",
    image: ISPminiCTFLogo,
    content: miniCTF2,
    route: "The-Queen's-Secret",
  },
  {
    title: "Flappy Bird — Write-up (ISP MiniCTF 2025)",
    date: "August 8, 2025",
    description:
      "Một write-up cho challenge Web tại miniCTF, kể lại hành trình khám phá và khai thác logic client-side để lấy flag. (500 điểm)",
    image: ISPminiCTFLogo,
    content: miniCTF3,
    route: "Flappy-Bird",
  },
];

export default Posts;
