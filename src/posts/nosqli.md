# NoSQL Injection (NoSQLi)

## 1. Định nghĩa ngắn

**NoSQL Injection** là lỗi xảy ra trên các cơ sở dữ liệu NoSQL (MongoDB, CouchDB, Redis, Cassandra, …) khi ứng dụng cho phép chèn dữ liệu không tin cậy mà ảnh hưởng trực tiếp tới cấu trúc truy vấn của DB NoSQL, cho phép attacker thao túng truy vấn để đọc/ghi/xóa dữ liệu hoặc thực thi mã (tuỳ hệ). NoSQL thường dùng truy vấn dạng document / JSON-like, nên vector tấn công khác SQL cổ điển — attacker lợi dụng các toán tử ($ne, $gt, $where, $regex, $exists, ...) hoặc object injection.


## 2. Vì sao NoSQLi thường bị bỏ qua

* Lập trình viên quen phòng SQLi (prepared statements) nhưng chưa hiểu query builder / driver NoSQL.
* NoSQL query thường là object/JSON, nên attacker có thể gửi object thay vì string (ví dụ `id[$ne]=null`).
* Một số driver ngầm hiểu JSON/objects, khiến input dạng JSON/object được parse thành truy vấn.


## 3. Các dạng NoSQLi phổ biến (với ý tưởng)

1. **Query Operator Injection**: chèn toán tử MongoDB (ví dụ `$ne`, `$gt`, `$in`, `$regex`) để thay đổi điều kiện.
2. **Type/Structure Injection (Object Injection)**: attacker gửi object/array thay vì string (ví dụ PHP `foo[$ne]=1`), dẫn đến filter khác.
3. **JavaScript/Code Injection**: dùng `$where` (MongoDB) hoặc chèn code để DB thực thi JavaScript (rất nguy hiểm).
4. **Regex Injection / ReDoS**: dùng regex phức tạp để gây Denial of Service do backtracking.
5. **Authentication Bypass**: thao túng query login (username/password) để bypass auth.
6. **Blind & Time-based NoSQLi**: tương tự SQLi — dùng side-channel, delays hoặc khác biệt phản hồi để dò.


## 4. Ví dụ minh hoạ (MongoDB, Node.js + Express)

### 4.1 Vulnerable code (không xử lý input)

```js
// Vulnerable: dùng body trực tiếp vào query
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // suppose users is a MongoDB collection
  const user = await users.findOne({ username: username, password: password });
  if (user) res.send('ok'); else res.send('fail');
});
```

**Attack vector (JSON-based):** gửi body `{ "username": { "$ne": null }, "password": { "$ne": null } }`

* Query trở thành: `{ username: { $ne: null }, password: { $ne: null } }` → sẽ match record có username/password khác null → bypass login.

### 4.2 PHP form array injection (classic)

Nếu backend PHP nhận `$_POST` và trực tiếp pass vào Mongo query:

```
POST body: username[$ne]=1&password[$ne]=1
```

PHP sẽ parse thành `$_POST['username'] = array('$ne' => '1')`, và nếu pass vào driver thì query có `$ne` operator.

### 4.3 $where / JS code execution

```
users.find({ $where: "this.password.length > 0 && this.username == 'admin'" })
```

Nếu attacker có khả năng inject vào `$where`, họ có thể chạy JS arbitrary.


## 5. Payload mẫu (lab-only)

* Simple operator injection (bypass auth): JSON body: `{ "username": {"$ne": null}, "password": {"$ne": null} }`
* Bypass with always-true: `{ "username": {"$gt": ""} }`
* Regex login bypass: `{ "username": {"$regex": "^admin$", "$options": "i"}, "password": {"$exists": true} }`
* $where execution (if injectable): `{ "$where": "function() { return this.password=='abc' || (this.username=='admin' && sleep(5000)) }" }` (note: depending on DB version)
* PHP array injection: `username[$ne]=1` (x-www-form-urlencoded)

**Chú ý:** payload tuỳ DB/driver/version; không dùng trên system thật.


## 6. Cách dò / kiểm thử NoSQLi

* Tìm chỗ dùng input để build filter/query: login, search, filters, sort, API endpoints, JSON endpoints.
* Thử gửi object/json thay vì string (vì many apps parse JSON).
* Dùng variations: `$ne`, `$gt`, `$in`, `$regex`, `$exists`, `$where` để thay đổi điều kiện.
* Kiểm tra request content-type khác (JSON vs form-url-encoded) vì parsing khác nhau.
* Kiểm tra PHP / Python / Ruby backend parsing behavior (PHP `foo[bar]=1` -> array).
* Test blind: quan sát response differences, timing, result counts.
* Dùng proxy (Burp) + script để automate payloads.

Công cụ: **NoSQLMap** (tương tự sqlmap), Burp Suite, custom scripts.


## 7. Hậu quả thực tế

* Bypass authentication (login as any user).
* Đọc/viết/xóa toàn bộ dữ liệu.
* Escalation to remote code execution (nếu driver cho phép JS eval e.g., $where với code).
* Data exfiltration, account takeover, impact to confidentiality/integrity/availability.


## 8. Phòng ngừa (Best Practices)

1. **Không bao giờ pass input raw vào query object** — luôn validate & canonicalize.
2. **Strict typing / casting**: ép kiểu (cast) input về đúng type trước khi dùng (ví dụ id => ObjectId, số => Number).
3. **Allowlist values**: dùng allowlist cho fields, sort, filters (ví dụ chỉ cho phép sort theo `['name','date']`).
4. **Disallow operator characters**: nếu input là string, escape hoặc reject các key bắt đầu bằng `$` hoặc chứa `.` (dấu chấm) khi không cần.

   * Trong Node.js/Mongoose có thể dùng `mongo-sanitize` hoặc tự sanitize: remove keys that start with `$` or contain `.`.
5. **Use parameterized / safe query builders / ORM**: e.g., Mongoose query APIs but be careful với `Model.where()` that accepts raw objects.
6. **Avoid $where / eval-like features**: disable or avoid using `$where`, server-side JavaScript execution.
7. **Least privilege DB user**: account used by app should have minimal rights.
8. **Rate limit & monitoring**: detect unusual patterns.
9. **Content-type strictness**: accept JSON only where expected; validate schema (e.g., using Joi, AJV).
10. **Use schema validation at DB level**: MongoDB schema validation (from v3.6+) to enforce field types/structure.
11. **Escape/encode when generating queries from strings**: if building string-based queries, escape carefully.


## 9. Secure-coding snippets (Node.js)

```js
// Sanitize input example
const sanitize = require('mongo-sanitize');
app.post('/search', (req, res) => {
  const q = sanitize(req.body.q); // removes $ and . keys
  // ensure q is string
  if (typeof q !== 'string') return res.status(400).send('bad');
  const results = await users.find({ name: new RegExp(escapeRegex(q), 'i') });
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

```js
// Cast ID safely
const { ObjectId } = require('mongodb');
function safeObjectId(id) {
  if(!ObjectId.isValid(id)) throw new Error('invalid id');
  return new ObjectId(id);
}
```

## 10. Checklist kiểm thử & remediation (quick)

* Tìm tất cả các endpoint nhận JSON/params/form data; xác định chỗ dữ liệu được dùng trong filter.
* Thử gửi object/json payloads với `$ne`, `$gt`, `$in`, `$regex`, `$exists`.
* Thử PHP-style array injection (`foo[$ne]=1`).
* Kiểm tra response khác biệt / timing để phát hiện blind.
* Kiểm tra server xử lý content-type khác nhau (text/plain, application/json, form).
* Thực thi fix: sanitize đầu vào, cast kiểu, remove `$`/`.` keys, use schema validation, deploy tests.