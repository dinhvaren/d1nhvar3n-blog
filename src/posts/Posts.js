import miniCTF1 from "../posts/miniCTF1.md";
import miniCTF2 from "../posts/miniCTF2.md";
import ISPminiCTF from "../assets/img/ispminictf.png";
import ISPminiCTFLogo from "../assets/img/ispminictf2.png";

const Posts = [
  {
    title: "Super Cookie — Write-up (ISP MiniCTF 2025)",
    date: "August 8, 2025",
    description:
      "Write-up chi tiết cho challenge Web 'Super Cookie' (cookie tampering & privilege escalation) — ISP MiniCTF 2025.",
    image: ISPminiCTF,
    content: miniCTF1,
    route: "miniCTF1-super-cookie",
  },
  {
    title: "The Queen's Secret — Write-up (ISP MiniCTF 2025)",
    date: "August 8, 2025",
    description:
      "Detailed story-mode write-up for the web challenge 'The Queen's Secret' (cookie tampering → privilege escalation). Includes Burp evidence, reproduction steps, and lessons learned. ISP MiniCTF 2025. (500 pts)",
    image: ISPminiCTFLogo,
    content: miniCTF2,
    route: "miniCTF2-The-Queen's-Secret",
  },
];

export default Posts;
