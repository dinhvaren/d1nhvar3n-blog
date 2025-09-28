import miniCTF1 from "../posts/miniCTF1.md";
import miniCTF2 from "../posts/miniCTF2.md";
import miniCTF3 from "../posts/miniCTF3.md";
import sqli from "../posts/sqli.md";
import ssrf from "../posts/ssrf.md";
import ssti from "../posts/ssti.md";
import Top10OWASP from "../posts/Top10-OWASP.md";
import xxe from "../posts/xxe.md";
import htmli from "../posts/htmli.md";
import idor_lfi_rce from "../posts/idor-lfi-rce.md";
import nosqli from "../posts/nosqli.md";
import musoe1Lab from "../posts/musoeCBJS.md";
import cbjsblogLab from "../posts/CBJSBlog.md";
import ISPminiCTF from "../assets/img/ispminictf.png";
import ISPminiCTFLogo from "../assets/img/ispminictf2.png";
import top10Logo from "../assets/img/owasp-top-ten-1000.png";
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
  {
    title: "SQL Injection (SQLi)",
    date: "Jun 20, 2025",
    description:
      "Tổng quan và thực hành SQL Injection (SQLi): các dạng (error/union/blind/time-based), payload mẫu, công cụ (sqlmap, Burp) và checklist phòng ngừa (prepared statements, least privilege).",
    image: top10Logo,
    content: sqli,
    route: "SQL-Injection",
  },
  {
    title: "Server-Side Request Forgery (SSRF)",
    date: "Jun 20, 2025",
    description:
      "phân loại SSRF, payload thực hành (http/file/gopher), cách dò (OOB/DNS), hậu quả (metadata, internal services) và biện pháp ngăn chặn (allowlist, egress firewall).",
    image: top10Logo,
    content: ssrf,
    route: "Server-Side-Request-Forgery",
  },
  {
    title: "OWASP Top 10",
    date: "Jun 20, 2025",
    description: "Tóm tắt OWASP Top 10 (2021) — định nghĩa từng mục, ví dụ thực tế và cách khắc phục ngắn gọn; cheat-sheet tiện ôn phỏng vấn cho pentester/dev-sec. ",
    image: top10Logo,
    content: Top10OWASP,
    route: "Top10OWASP",
  },
  {
    title: "XXE (XML External Entity)",
    date: "Jun 20, 2025",
    description: "cách hoạt động của external entity, ví dụ in-band/OOB/billion-laughs, test lab và cách cấu hình parser an toàn (Java/Python/.NET).",
    image: top10Logo,
    content: xxe,
    route: "XML-External-Entity",
  },
  {
    title: "HTML Injection & XSS",
    date: "Jun 20, 2025",
    description: "phân loại (reflected/stored/DOM), context-aware escaping, payload mẫu và defensive coding (escape theo context, DOMPurify, CSP).",
    image: top10Logo,
    content: htmli,
    route: "html-injection",
  },
  {
    title: "IDOR, LFI & RCE",
    date: "Jun 20, 2025",
    description: "cơ chế từng loại, ví dụ vulnerable (PHP/Node), cách dò, chuỗi tấn công có thể dẫn tới RCE và checklist fix nhanh.",
    image: top10Logo,
    content: idor_lfi_rce,
    route: "idor-lfi-rce",
  },
  {
    title: "NoSQL Injection",
    date: "Jun 20, 2025",
    description: "operator/object injection, ví dụ PHP/Node, payload phổ biến (`$ne`, `$regex`), cách dò và biện pháp phòng (sanitize, cast, schema validation).",
    image: top10Logo,
    content: nosqli,
    route: "NoSQL-Injection",
  },
    {
    title: "Server-Side Template Injection (SSTI)",
    date: "Jun 20, 2025",
    description: "Lỗ hổng khi server render template từ input người dùng (Jinja2/Twig/ERB, ...), cho phép chèn biểu thức/object trong template để leak thông tin hoặc thực thi mã (RCE). Bao gồm payload detect phổ biến, dấu hiệu nhận biết và biện pháp phòng ngừa (không render template do user cung cấp, bật autoescape, sandbox, validate/whitelist input).",
    image: top10Logo,
    content: ssti,
    route: "Server-Side Template Injection",
  },
];

export default Posts;
