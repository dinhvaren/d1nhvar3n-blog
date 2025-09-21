import FirstBlogPost from "../posts/sample.md";
import FirstBlogPostImage from "../assets/img/post_1.png";

const Posts = [
  {
    title: "Super Cookie — Write-up (ISP MiniCTF 2025)",
    date: "August 8, 2025",
    description:
      "Write-up chi tiết cho challenge Web 'Super Cookie' (cookie tampering & privilege escalation) — ISP MiniCTF 2025.",
    image: FirstBlogPostImage,
    content: FirstBlogPost,
    route: "miniCTF1-super-cookie",
  },
  {
    title: "Learn How to Create a Blog With These Simple Steps",
    date: "January 4, 2021",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: FirstBlogPostImage,
    content: FirstBlogPost,
    route: "cool-blog-post",
  },
];

export default Posts;
