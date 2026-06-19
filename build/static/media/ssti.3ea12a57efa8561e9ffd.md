Rồi 👍 mình viết **SSTI (Server-Side Template Injection)** theo cùng cấu trúc bạn vừa dùng cho SSRF nhé — đầy đủ từ định nghĩa, phân loại, payload, hậu quả đến phòng ngừa.

---

# 1) SSTI là gì — tóm tắt

**Server-Side Template Injection (SSTI)** là lỗi khi ứng dụng render **template** trên server nhưng lại cho phép dữ liệu từ user trở thành **một phần template** . Attacker có thể chèn biểu thức template để engine thực thi → từ leak data đến **RCE** (nếu engine cho phép truy cập object hệ thống).


# 2) Phân loại SSTI & ví dụ cho mỗi loại

## A. Basic SSTI (In-band)

**Mô tả:** attacker chèn biểu thức đơn giản để xác nhận engine có evaluate.

**Ví dụ vulnerable code (Node.js EJS pseudo):**

```js
app.get('/hello', (req, res) => {
  const tmpl = "<h1>Hello " + req.query.name + "</h1>"; // user input nối trực tiếp
  res.send(ejs.render(tmpl));
});
```

**Payload (lab):**

```
/hello?name=<%= 7*7 %>
```

Nếu output hiển thị `49` → chứng tỏ SSTI.

**Hậu quả:** chứng minh khả năng thực thi expression, mở đường leo thang.


## B. Variable/Object Access

**Mô tả:** attacker từ input truy xuất biến trong context hoặc class nội bộ.

**Ví dụ payload (Jinja2, lab):**

```
{{ config.items() }}
```

→ đọc config Flask app.

**Hậu quả:** lộ secrets, config, env vars.


## C. Sandbox Escape / RCE

**Mô tả:** nếu engine cho phép truy cập object chain, attacker leo tới OS-level calls.

**Ví dụ lab payload (Jinja2):**

```
{{ ''.__class__.__mro__[1].__subclasses__() }}
```

→ dò các class, từ đó tìm subprocess/os → thực thi lệnh.

**Hậu quả:** Remote Code Execution.


## D. Blind SSTI

**Mô tả:** response không hiển thị trực tiếp kết quả expression, nhưng attacker suy ra qua side-channel (thời gian, lỗi).

**Payload test (lab):**

```
{{ 7/0 }}
```

Nếu server trả error stacktrace liên quan template engine → SSTI blind.


# 3) Payload mẫu (lab-only)

* Detect:

  * `{{7*7}}` (Jinja2/Twig)
  * `<%= 7*7 %>` (ERB/EJS)
* Access variable:

  * `{{ request.headers }}` (Flask/Jinja2)
* Blind/error-based:

  * `{{ 1/0 }}` → error
* Sandbox escape (lab):

  * `{{ ''.__class__.__mro__[1].__subclasses__() }}`


# 4) Cách phát hiện / kiểm thử SSTI

* Tìm endpoint render output từ input (profile name, message template, error page).
* Thử payload benign (`{{7*7}}`) → nếu evaluate → SSTI.
* Thử gây error (`{{1/0}}`) → nếu stacktrace của template engine lộ ra.
* Kiểm tra logs/error server để xác nhận.


# 5) Hậu quả thực tế

* Data exposure (config, env vars).
* Template tampering (modify view logic).
* RCE (truy cập object chain → gọi hệ thống).
* Toàn quyền server, lateral movement.


# 6) Phòng ngừa — best practices

1. **Không render template từ input user** (chỉ render template file sẵn có).
2. **Escape / autoescape**: bật autoescape (Jinja2 `select_autoescape`, Twig autoescape).
3. **Whitelist template features**: tắt eval, `$where`, helpers nguy hiểm.
4. **Không bind object nhạy cảm** (os, db, config) vào template context.
5. **Sandbox (nếu thật cần)**: dùng sandboxed environment, nhưng vẫn dễ bypass.
6. **Validate input**: chỉ inject dữ liệu primitive (string/number), không object/code.
7. **Code review / pentest**: kiểm tra chỗ `render(user_input)` hoặc `compile()` từ input.


# 7) Ví dụ sửa code (Node.js với Handlebars)

**Vulnerable:**

```js
app.get('/hello', (req, res) => {
  const tmpl = req.query.tmpl; // user cung cấp template
  res.send(Handlebars.compile(tmpl)({}));
});
```

**Safe:**

```js
const template = Handlebars.compile("Hello, {{name}}!");
app.get('/hello', (req, res) => {
  const name = String(req.query.name || 'guest'); // ép kiểu
  res.send(template({ name }));
});
```


# 8) Checklist kiểm thử & remediation

* [ ] Xác định endpoint nào render template từ input.
* [ ] Test `{{7*7}}`, `<%=7*7%>` để detect.
* [ ] Test error (`{{1/0}}`).
* [ ] Kiểm tra context leak (`{{config}}`).
* [ ] Remediate: không render user template, enable autoescape, remove dangerous helpers, sandbox/validate.
