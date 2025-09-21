import miniCTF1 from "../posts/miniCTF1.md";
import miniCTF2 from "../posts/miniCTF2.md";
import musoe1Lab from "../posts/musoeCBJS.md";
import ISPminiCTF from "../assets/img/ispminictf.png";
import ISPminiCTFLogo from "../assets/img/ispminictf2.png";
import CbjsLogo from "../assets/img/cbjs.png";

const Posts = [
  {
    title: "Musoe 01 — Write-up (Cyberjutsu 2025)",
    date: "Sep 17, 2025",
    description:
      "Story-mode write-up for the 'Musoe 01' web challenge (Cyberjutsu 2025). Khám phá cửa hàng ẩn, tận dụng logic mua hàng để lấy được flag. Bao gồm bước phân tích, thử nghiệm và khai thác thành công.",
    image: CbjsLogo,
    content: musoe1Lab,
    route: "cbjs-musoe-01",
  },
  {
    title: "Super Cookie — Write-up (ISP MiniCTF 2025)",
    date: "August 8, 2025",
    description:
      "Bài write-up chi tiết cho thử thách Web 'Super Cookie' (chỉnh sửa cookie & leo thang đặc quyền) — ISP MiniCTF 2025.",
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
];

export default Posts;
