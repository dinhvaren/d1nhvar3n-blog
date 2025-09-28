# XXE (XML External Entity)

**XXE (XML External Entity)** là lỗ hổng khi parser XML cho phép xử lý các entity bên ngoài — kẻ tấn công có thể lợi dụng để đọc file cục bộ, SSRF, thực hiện Remote File Inclusion, hoặc làm OOB (out-of-band) exfiltration nếu parser tải và xử lý nội dung bên ngoài.


# 1) Cơ chế & ý tưởng

* XML cho phép định nghĩa `<!DOCTYPE ...>` và `<!ENTITY ...>`; nếu parser cho phép `external entity` (ví dụ `<!ENTITY xxe SYSTEM "file:///etc/passwd">`), khi XML chứa tham chiếu `&xxe;` parser sẽ thay thế bằng nội dung file/URL.
* Vấn đề xuất phát từ parser cấu hình mặc định cho phép xử lý external entities / DTD.
* Hậu quả: lộ file nội bộ (Local File Disclosure), SSRF (server gọi URL nội bộ), blind exfil (DNS/HTTP OOB), remote code execution trong một số nền tảng.


# 2) Các dạng XXE (phổ biến)

1. **In-band (Direct) Local File Disclosure**
   * Parser đọc file cục bộ và trả nội dung trong response.
   
2. **SSRF / Remote Resource Fetch**
   * External entity trỏ đến URL ([http://intranet/](http://intranet/)...) → server request tới internal service.

3. **Out-of-band (OOB) Exfiltration**
   * Entity trỏ tới attacker-controlled server (DNS/HTTP) để exfil dữ liệu (thường dùng khi response không hiển thị nội dung).

4. **Blind XXE / Time-based**
   * Không có response trực tiếp; dùng side-effects hoặc timing để dò.

5. **Billion Laughs / XML Entity Expansion (XXE variant / DoS)**
   * Lợi dụng nested entities (entity expansion) để làm exhaustion memory/CPU (a.k.a. XML bomb) — gây DoS.

6. **XXE kết hợp với SSRF/SSRF to RCE**
   * Khi server có endpoint thực thi hoặc parser có lỗ hổng bổ sung.


# 3) Ví dụ minh họa (an toàn, để hiểu cơ chế)

**Vulnerable XML (minh hoạ concept):**

```xml
<?xml version="1.0"?>
<!DOCTYPE data [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<data>&xxe;</data>
```

* Nếu parser xử lý external entities, `&xxe;` sẽ được thay bằng nội dung file `/etc/passwd` và có thể hiển thị/được trả về trong response.

**Lưu ý:** ví dụ trên chỉ để hiểu cơ chế — không chạy trên hệ thống thật trừ khi là lab.


# 4) Cách kiểm thử / dò (lab-style, an toàn)

* Tìm các endpoint nhận XML (SOAP, REST endpoints accept XML, file upload, SAML, RSS/ATOM parsers).
* Thử gửi XML có `<!DOCTYPE ...>` với external entity tham chiếu tới:

  * local file (file:///...),
  * internal URL ([http://localhost:port/](http://localhost:port/)... ),
  * attacker-controlled host (nên dùng lab server) để kiểm tra OOB.
* Kiểm tra cả response trực tiếp (in-band) và không trực tiếp (OOB/DNS).
* Kiểm tra khả năng bị XML Entity Expansion (billion laughs) bằng payloads đơn giản (tăng kích thước tài nguyên) — xem parser có bảo vệ.
* Dùng proxy (Burp) để mod request, và công cụ scanner nếu cần.
  **Quan trọng:** test OOB chỉ với server/host mà em kiểm soát (lab).


# 5) Detect nhanh (triệu chứng)

* Response chứa dữ liệu lạ (nội dung file, nội dung từ internal service).
* Server thực hiện requests tới internal addresses (xem logs).
* Kết quả lỗi liên quan XML parser khi gửi DOCTYPE (có stack trace hiển thị).
* Bất thường network traffic đến host em kiểm soát (đối với OOB tests).


# 6) Code — cách fix / secure parsing (các ví dụ cụ thể)

### Java (DocumentBuilderFactory / SAX) — **khuyến nghị**

**Vulnerable pattern**: mặc định `DocumentBuilderFactory` cho phép external entities / DTD trên một số cấu hình.
**Secure configuration (tắt DTD & external entities):**

```java
// Java secure XML parsing (DOM)
DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();

// Disable DTDs (do not load external DTDs)
dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);

// Disable external entities
dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);

// Disable external DTDs as well
dbf.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);

dbf.setXIncludeAware(false);
dbf.setExpandEntityReferences(false);

DocumentBuilder db = dbf.newDocumentBuilder();
```

* **Giải thích ngắn:** tắt xử lý DOCTYPE và external entities -> parser không tải file/URL bên ngoài.

### Java (StAX / SAX) — tương tự: set features để disable external entities.

### Python (lxml / defusedxml)

* **Không dùng** `lxml.etree.fromstring` trực tiếp trên dữ liệu không tin cậy nếu chưa cài cấu hình an toàn.
* Use `defusedxml` library (được thiết kế phòng chống XXE/DoS):

```python
from defusedxml.ElementTree import fromstring  # safe replacement
tree = fromstring(xml_data)
```

* Hoặc với `lxml` disable DTD:

```python
from lxml import etree
parser = etree.XMLParser(resolve_entities=False, no_network=True, dtd_validation=False)
root = etree.fromstring(xml_data, parser)
```

### .NET (C#) — XmlReaderSettings

```csharp
var settings = new XmlReaderSettings
{
    DtdProcessing = DtdProcessing.Prohibit, // disable DTD
    XmlResolver = null // prevents external resource resolution
};
using (var reader = XmlReader.Create(stream, settings))
{
    var doc = XDocument.Load(reader);
}
```

### PHP (libxml)

```php
libxml_disable_entity_loader(true); // deprecated in newer PHP versions - prefer using proper parser options
$dom = new DOMDocument();
$dom->loadXML($xml, LIBXML_NOENT | LIBXML_DTDLOAD); // don't use these flags with untrusted input
// Better: avoid enabling NOENT/DTDLOAD; use XMLReader and disable DTDs.
```

* **Ghi chú:** vì API khác nhau theo ngôn ngữ/phiên bản; mục tiêu là **khóa DTD + disable external entity resolution**.


# 7) Prevention (best practices, checklist)

1. **Disable DTD processing and external entity resolution** ở parser (primary).
2. **Sử dụng parser an toàn / libraries chuyên dụng** (defusedxml, secure settings).
3. **Nếu cần xử lý XML từ nguồn tin cậy duy nhất**, xác thực và whitelist sources; avoid processing XML from untrusted inputs.
4. **Không cho phép DOCTYPE trong XML nhận vào** — reject request có `<!DOCTYPE`.
5. **Nếu phải xử lý SAML/third-party XML**, dùng thư viện SAML được cấu hình an toàn và validate signatures.
6. **Set XmlResolver = null / no_network / no external DTD option** theo ngôn ngữ.
7. **Apply network egress filtering / outbound access restriction**: server không nên có quyền tùy ý truy cập vào internet/internal network từ process parsing XML.
8. **Least privilege runtime**: tách service, không cho phép đọc file nhạy cảm bằng tài khoản ứng dụng.
9. **Rate-limit & size limits**: giới hạn size/complexity của XML để tránh entity expansion DoS.
10. **Logging & monitoring**: detect unusual outbound requests, DTD-related payloads, parse errors.
11. **Defense-in-depth**: WAF rules + input validation (reject XML containing DOCTYPE if not needed).


# 8) Testing checklist (pentest / dev-sec)

* [ ] Tìm endpoint nhận XML (SOAP, REST XML body, SAML, file upload).
* [ ] Thử gửi XML có `<!DOCTYPE [...]>` và refer tới file:// (lab) / internal URL (lab) / attacker OOB server (lab) — kiểm tra in-band & OOB.
* [ ] Thử entity expansion (billion laughs) để kiểm tra bảo vệ DoS.
* [ ] Kiểm tra logs / network egress / app behavior.
* [ ] Xác minh fixes: gửi payload cũ và confirm parser không load entities / trả lỗi / reject.

