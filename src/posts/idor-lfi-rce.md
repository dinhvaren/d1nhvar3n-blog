# 1) LFI — Local File Inclusion

**Định nghĩa ngắn:** LFI xảy ra khi ứng dụng cho phép include/ đọc file trên máy chủ dựa trên input của user mà không kiểm soát — attacker có thể đọc file cục bộ, lộ thông tin nhạy cảm, hoặc kết hợp với file upload → RCE.

**Cơ chế:** thường do dùng `include`, `require`, `file_get_contents`, `readfile` với tham số từ user mà không sanitize/canonicalize.

**Ví dụ (PHP — vulnerable):**

```php
<?php
// vulnerable.php
// WARNING: minh hoạ lỗ hổng; chỉ dùng để hiểu
$page = $_GET['page'];               // user-controlled
include("/var/www/pages/" . $page);  // nếu không kiểm tra => LFI
?>
```

**Vấn đề:** attacker có thể truyền `../../../../etc/passwd` (path traversal) hoặc kết hợp upload webshell rồi include nó.

**Phát hiện / dò (lab):**

* Tìm endpoint dùng include/read file (page, template, download, logs).
* Thử path traversal (`../`) variations, URL-encode, null-byte (cũ) trong lab.
* Kiểm tra response chứa nội dung file, lỗi tiết lộ path, hoặc khác biệt nội dung.
* Kết hợp với file upload: upload file rồi include nó.

**Hậu quả:** lộ config, creds, source code; RCE nếu kết hợp upload + include executable; thông tin nhạy cảm.

**Phòng ngừa / fix:**

* Không dùng input trực tiếp làm path. Dùng allowlist (map key → file path).
* Canonicalize & normalize path, rồi verify path nằm trong thư mục an toàn (chroot-like).
* Không cho phép `..` hoặc các ký tự path traversal; reject hoặc encode.
* Nếu cần đọc file user-provided: chỉ cho phép filename đơn (không path), hoặc lookup từ DB.
* Hạn chế quyền tài khoản webserver (no read of /etc, minimal privileges).
* Tắt hiển thị lỗi chi tiết trên production.

# 2) IDOR — Insecure Direct Object Reference

**Định nghĩa ngắn:** IDOR là khi ứng dụng sử dụng identifier trực tiếp (id, filename, uuid) để truy xuất tài nguyên mà không kiểm tra authorization — attacker thay id để truy cập tài nguyên người khác.

**Cơ chế:** thiếu kiểm tra quyền khi mapping `user -> object id`. Ví dụ `GET /download?file_id=1234` mà server chỉ check tồn tại chứ không check owner.

**Ví dụ (pseudo / PHP):**

```php
// vulnerable download
$file_id = $_GET['file_id'];
$file = find_file_by_id($file_id);   // trả về object {owner_id, path}
readfile($file->path);               // NO authorization check!
```

**Vấn đề:** attacker thay `file_id` thành ID của người khác để tải file private.

**Phát hiện / dò (lab):**

* Tìm các tham số thể hiện id (id, file_id, invoice, order, user_id).
* Thử thay giá trị id (incre/guess) và xem có access hay không.
* Kiểm tra JSON APIs: thay `user_id` trong body, hoặc object_id in URL.
* Kiểm tra predictable ids (incremental) dễ dò hơn UUID.

**Hậu quả:** lộ dữ liệu người khác, leak tài liệu, có thể leak PII.

**Phòng ngừa / fix:**

* Luôn check **authorization**: verify current_user is owner or has permission on the object.
* Không dùng predictable ids nếu không cần; nhưng chính yếu là authorization check, không masking id.
* Use per-resource ACL checks in backend, centralized authorization logic (avoid ad-hoc).
* Rate-limit and audit access to sensitive endpoints.
* Use unguessable references (random UUIDs) *as additional* mitigation but **do not rely on it**.

# 3) RCE — Remote Code Execution

**Định nghĩa ngắn:** RCE xảy ra khi attacker có thể khiến server/thực thể chạy mã (shell command, code) do họ kiểm soát — hậu quả nặng nề: takeover server, pivoting, persistent compromise.

**Cơ chế & các vector phổ biến:**

* **Command Injection**: trực tiếp chèn input vào shell command (e.g., `system("ping $host")`) → `; rm -rf /` style.
* **Unsafe eval / template injection / expression language (EL) injection**: dùng `eval()`/`exec()` hoặc template engine cho phép chạy code từ input.
* **Deserialization**: insecure deserialization dẫn tới gadget chain → RCE.
* **File upload + webshell / LFI/RFI chain**: upload file + include/excute.
* **Dependency gadget / insecure libraries** (e.g., vulnerable image processors, native libs).
* **SSRF → internal service that executes commands** (chaining).

**Ví dụ (vulnerable command injection in PHP):**

```php
<?php
$ip = $_GET['ip'];
// vulnerable: directly concatenated to shell command
$output = shell_exec("ping -c 1 " . $ip);
echo "<pre>$output</pre>";
?>
```

**Vấn đề:** attacker gửi `8.8.8.8; cat /etc/passwd` → may execute extra commands (depends on escaping).

**Phát hiện / dò (lab):**

* Tìm code gọi shell, eval, templates, image processors, deserialization points, file upload + include, or endpoints that run system commands.
* Test with safe lab payloads that trigger observable side effects (timing, output) — **only in lab**.
* Kiểm tra input passed to `exec`, `system`, `popen`, `Runtime.exec`, `ProcessBuilder`, template `{{ }}` evaluation points.

**Phòng ngừa / fix (defense-in-depth):**

1. **Never pass user input to shell commands directly.** Use safe APIs with argument arrays (no shell).

   * In PHP, use `proc_open` carefully or better libraries. In Java, use `ProcessBuilder` with args array and avoid shell parsing.
2. **Escape & validate input strictly.** Prefer allowlist (IP pattern, hostname regex) not blacklist.
3. **Avoid `eval()` / `system()` / `exec()` when possible.** If unavoidable, sandbox and validate.
4. **Sanitize template engines / use safe template configs.** Disable expression language evaluation from untrusted sources.
5. **Harden deserialization:** whitelist classes, sign payloads, or avoid native serialization.
6. **Harden file uploads:** store outside webroot, rename files, validate type, disallow executable extensions.
7. **Run with least privilege:** web user minimal rights; containerize; limit capabilities.
8. **Egress/ingress controls & monitoring**: prevent outbound C2, monitor processes, use EDR.
9. **Patch & update dependencies** (image libs, native libs).
10. **Use WAF / RASP** as mitigation (not substitute).