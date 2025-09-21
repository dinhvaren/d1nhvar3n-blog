# Flappy Bird (Web - 500 pts)

> Một write-up cho challenge Web tại miniCTF, kể lại hành trình khám phá và khai thác logic client-side để lấy flag.  
> Chủ đề: JavaScript analysis, client-side logic, fetch endpoint.

## Table of Contents
- [1. Mở đầu — một buổi chiều mưa và một con chim tò mò 🐦🌧️](#mở-đầu)
- [2. Vào chơi — click, chết, replay — và một phản hồi lạ](#vào-chơi)
- [3. False flag — Lột mặt nạ](#false-flag)
- [4. Phân tích ngắn — tại sao tác giả làm thế?](#phân-tích-ngắn)
- [5. Một dòng code lạc lõng — dấu vết xuất hiện ở dòng 65](#dấu-vết-dòng-65)
- [6. `/script.js` — file trông bình thường nhưng chứa thứ "khủng"](#scriptjs)
- [7. Kiểm tra định dạng — flag hay là mồi?](#kiểm-tra-định-dạng)
- [8. Nội tâm của thám tử — từ nghi ngờ đến quyết tâm](#nội-tâm)
- [9. Kế hoạch tấn công tư duy — những việc mình làm tiếp theo (ngắn gọn nhưng hành động)](#kế-hoạch-tấn-công)
- [10. Bí mật hiện ra ở dòng 94 — một hàm lặng lẽ gọi `get_flag.php`](#bí-mật-dòng-94)
- [11. Phút giây quyết định ở dòng 127 — điều kiện mở kho](#phút-giây-quyết-định)
- [12. Ngón tay vụt qua Console — cheat code của thám tử](#ngón-tay-console)
- [13. Kể lại khoảnh khắc — cinematic closure](#kể-lại-khoảnh-khắc)
- [14. Kết thúc — con chim đã hạ cánh](#14-kết-thúc--con-chim-đã-hạ-cánh)
- [Appendix — Evidence & bước tái hiện nhanh](#appendix-evidence--bước-tái-hiện-nhanh)

## 1. Mở đầu — một buổi chiều mưa và một con chim tò mò 🐦🌧️

Một ngày tôi mở challenge **Flappy Bird** (link: `http://103.249.117.57:6637/`). Màn hình chào đón rất “game”: canvas chơi ở giữa, leaderboard bên phải, dòng chữ *Tea Cups* và nút **START ADVENTURE** — giống như một trang game nhỏ được dựng để thu hút. Không có hint, chỉ có một lời thách: *Bạn có thể tìm ra bí mật ẩn trong trò chơi này không?*

![Dashboard - Flappy Bird challenge](/images/miniCTF/FlappyBird/dashbroad.png)

Tôi nhẩm nghĩ: trong CTF, những trang dạng game thường giấu manh mối trong HTML/JS hoặc endpoints client — không phải lúc nào cũng là lỗi server phức tạp. Vì vậy, chiến thuật của tôi là: **chơi thử → bắt traffic → đọc mã client**.

## 2. Vào chơi — click, chết, replay — và một phản hồi lạ

Tò mò, tôi nhấn **START ADVENTURE** và chơi vài lượt:

- Màn hình game hoạt động bình thường: nhân vật nhảy, tránh ống, điểm (tea cups) tăng, cuối cùng hiện “GAME OVER”.  
- Ghi nhận: UI hiển thị số `Tea Cups` và một phần footer có chỗ dành cho “flag message” (nhưng ban đầu bị ẩn).

![Play test - screenshot](/images/miniCTF/FlappyBird/testgame.png)

Mình nhấn Play vài lần, con chim chết nhiều lần như mọi người chơi bình thường. Nhưng sau mỗi lượt, mình mở Developer Tools → Network → HTTP History để quan sát các request/response.Ở phần GET / (trang chính), trong response text có một đoạn trông giống flag. 

![Fake flag in GET / response](/images/miniCTF/FlappyBird/requestindex.png)

> Lúc đầu mình mừng rỡ tưởng trận này nhẹ, flag hiện luôn ở `GET /` 
> nhưng cảm giác đó nhanh chóng bị thay bằng nghi ngờ: **tại sao flag lại dễ lấy đến vậy?**

![Fake flag](/images/miniCTF/FlappyBird/fakeflag1.png)

Hành động này giúp tôi xác nhận: trang có logic client-side để cập nhật điểm và hiển thị/ẩn một khu vực UI — nên rất nên kiểm tra mã JS đi kèm.

## 3. False flag — Lột mặt nạ

Mình copy đoạn "flag" từ response và thử submit lên scoreboard/submit box (hoặc kiểm tra format). Kết quả: **không hợp lệ**. Sau soi kĩ, có vài dấu hiệu cho thấy đó là fake flag:
- Flag xuất hiện ngay trong HTML response của `/` — thường flag thật không được hiển thị ở trang chính công khai.
- Nếu đây là một challenge “web”, flag thật thường phải được sinh hoặc bảo vệ bởi logic server (POST/scoreboard, token, database query, hoặc endpoint phụ).
- Flag trong response có thể là một decoy (đánh lừa người chơi), hoặc dữ liệu dùng cho UI (ví dụ text placeholder) chứ không phải flag thực.

> thấy flag trông hợp lệ nhưng khi thử submit thì bị từ chối — khớp với giả thuyết fake/decoy.

## 4. Phân tích ngắn — tại sao tác giả làm thế?

Cách tác giả đặt một fake flag trong `GET /` có vài mục đích có ý nghĩa:
- Lừa người chơi hời hợt: ai không kiểm tra kỹ sẽ nộp luôn và thất bại.
- Hướng chơi: buộc người chơi phải đào sâu — inspect JavaScript, API, WebSocket, localStorage, database endpoints.
- Kiểm tra kỹ năng: thách thức người chơi tìm được flag thật bằng cách reverse client, tìm API ẩn, hoặc trigger event trong gameplay.

## 5. Một dòng code lạc lõng — dấu vết xuất hiện ở dòng 65

Mình kéo chuột xuống response của `GET /` một lần nữa, đọc từng dòng như đọc nhật ký của một kẻ lén lút. Ở dòng 65 — giữa những thẻ HTML, có một đoạn nhỏ gợi ý: một đường dẫn tới `script.js`. “Nếu trong `view-source` không có gì thì sao?” — câu hỏi tự nhiên bật ra. Trang HTML có vẻ đơn thuần, nhưng server vẫn thả ra một pointer đến file JavaScript riêng — **chắc chắn là nơi đáng xem**.

Cảm giác giống như phát hiện một mẩu giấy gấp trong lòng sách: nhỏ, mộc, nhưng có thể chứa bí mật. Mình nhấp vào đường dẫn đó như một thám tử khẽ mở một ngăn tủ bất thường. 

![Line 65 - pointer to script.js](/images/miniCTF/FlappyBird/endpontjs.png)
> *nơi phát hiện `script.js` ở dòng 65*

## 6. `/script.js` — file trông bình thường nhưng chứa thứ "khủng"
Truy cập `GET /script.js` và… bingo. File JavaScript không dài, nhưng ngay ở đầu có một chuỗi nhìn giống flag. Mình copy nó, tim đập nhanh — có cảm giác vừa gần vừa xa với chiến thắng. 

![Fake flag in script.js](/images/miniCTF/FlappyBird/requestjs.png)
> *flag hiện trong `script.js`.*

Nhưng trong đầu mình lại gợn một điều: **tại sao author để flag trong JS client?** Đây là web challenge nhưng flag hiển thị công khai trên client — giống như chủ nhà để chìa khóa dưới thảm chào khách. Hiền lành quá, hoặc là... *cái bẫy đang chờ.*

## 7. Kiểm tra định dạng — flag hay là mồi?

Mình không nộp ngay. Thứ nhất vì đã trải nghiệm lần trước: flag “trong trang” hóa ra là fake. Thứ hai vì có một quy ước nhỏ mà mình luôn nhớ: mọi flag chính thức trong cuộc thi này bắt đầu bằng miniCTF{...}. Nhưng flag mình tìm thấy trong `script.js` bắt đầu bằng `minCTF{...}` — thiếu một chữ `i`. Một lỗi chính tả? Hay cố tình?

![Fake flag 2](/images/miniCTF/FlappyBird/fakeflag2.png)

Cảm giác lạnh lạnh rồi: đây lại là một fake flag — tinh tế hơn, đánh vào mắt người chơi vội vàng. (Hình 7 minh họa sự khác biệt: `miniCTF{...}` vs `minCTF{...}`.)

## 8. Nội tâm của thám tử — từ nghi ngờ đến quyết tâm

Ở điểm này mình có hai cảm xúc song hành: tức vì bị đánh lừa, và hừng hực vì thử thách được nâng cấp. Tác giả dùng **fake flag với biến thể gần giống** để lọc những ai copy-paste mà không kiểm tra quy ước. Rõ ràng họ muốn người chơi:

- Phải biết quy ước flag (miniCTF{}),
- Phải biết so sánh chuỗi, không nộp đại,
- Phải điều tra sâu hơn: file JS chứa decoy, còn flag thật sẽ nằm ở chỗ khác — có thể trên server, trong endpoint chỉ trả khi có điều kiện, hoặc là phải kết hợp một hành động trong game để trigger.

Mình tự nhủ: “*Ok, họ chơi fair-play theo cách của họ — mình sẽ trả lời bằng sự tỉ mỉ*.”

## 9. Kế hoạch tấn công tư duy — những việc mình làm tiếp theo (ngắn gọn nhưng hành động)

Mình viết ra checklist để lần theo dấu vết — đây là thứ mình định làm ngay sau đó:
### 1. Search toàn bộ JavaScript
- Dò tiếp script.js xem có hàm nào mã hóa/giải mã flag không (ví dụ atob, decode, xor, hexToStr), hoặc có URL khác được build động trong JS.
### 2. Tìm chuỗi 'miniCTF' trong toàn bộ nguồn
- Kiểm tra xem có chỗ nào ghép chuỗi, so sánh, hoặc validate flag theo format không.
### 3. Quan sát Network khi tương tác game
- Chơi, đạt một mốc (ví dụ score nhất định) xem có request mới nào xuất hiện (POST /submit, GET /get_flag, WebSocket messages...).
- Bật tab WS và XHR — devs thường dùng WS để gửi event game-time.
### 4. Thử các endpoint liên quan
- Truy cập /get_flag, /flag, /admin, /get_flag.php, /api/flag, /submit_score v.v. với đủ headers (Referer, Cookie).
- Để ý header Referer — có thể server kiểm tra game origin.
### 5. Kiểm tra logic client-server
- Nếu trong JS có request đến get_flag.php hoặc tương tự, mở và đọc (nếu truy cập được) — hoặc thử gọi trực tiếp bằng curl với body/headers tương tự.
### 6. Kiểm tra storage & cookies
- Xem localStorage / sessionStorage / cookie — có thể flag thật được giải mã & lưu ở client sau khi hoàn thành điều kiện.
### 7. So sánh fake vs thật
- Lưu mọi bằng chứng: screenshot, response bodies, timestamps để đưa vào write-up cuối cùng.

## 10. Bí mật hiện ra ở dòng 94 — một hàm lặng lẽ gọi get_flag.php
Tôi kéo tiếp xuống, đọc `script.js` như đọc một bức thư rải rác mã. Ở dòng 94 xuất hiện một hàm có tên `returntof()` — ngắn gọn, nhưng hành động của nó lại to như sấm: hàm này dùng **Fetch API** để gọi `get_flag.php`. Logic rất đơn giản và lạnh lùng:

- Gọi `fetch('get_flag.php')`.
- Nếu `response.ok` thì `response.text()` → gán vào `#flagContainer` và `console.log` ra một chuỗi mà trông rất giống flag.

Một chi tiết nhỏ nhưng quan trọng: **flag được trả trực tiếp từ endpoint `get_flag.php` nếu được gọi đúng cách**. Đây không còn là mồi tinh vi nữa — đây là cánh cửa — chỉ cần ai đó biết cách gõ đúng thì cửa mở. 

![script.js - returntof() fetch get_flag.php](/images/miniCTF/FlappyBird/codejs94.png)

Với dòng gọi `fetch` làm mình giật mình: “Ồ, vậy là server có flag thật, vấn đề chỉ là khi nào nó chịu trả.”

## 11. Phút giây quyết định ở dòng 127 — điều kiện mở kho

Tiếp tục cuộn, đến dòng 127 tôi thấy một hàm khác xử lý điểm số: hàm nhận tham số `newScore`. 

![script.js - updateScore condition](/images/miniCTF/FlappyBird/codejs127.png)

Trong hàm này có điều kiện kỳ lạ:
```js
if (newScore >= 10000000000) {
    returntof();
}
```
Nghĩa là: **chỉ khi điểm đạt >= 10,000,000,000 thì client mới gọi `returntof()`**, tức mới yêu cầu `get_flag.php` và hiển thị flag. Tác giả đã đặt một điều kiện "gameplay" vô cùng khắc nghiệt — một con số gần như vô lý để đạt bằng cách chơi thật. Đây là một cái bẫy thông minh: flag thật bị khóa phía client bằng điều kiện về score, thay vì ở server bằng token hay session. Hình 9 phơi bày cái câu điều kiện đó — và trong đầu tôi bắt đầu thấy một con đường tắt.

## 12. Ngón tay vụt qua console — cheat code của thám tử
Lúc này hai lựa chọn hiện ra:

- Cố gắng “chơi” đến con số vô lý kia (không khả thi), hoặc
- **Gọi hàm nội bộ bằng DevTools** — mà `script.js` đã thực thi trên trang, nên các hàm đó đang sống trong scope `window`.

Tôi mở **DevTools → Console**, gõ mạnh vào như gõ một mật khẩu bí mật:
```js
updateScore(10000000000)
```
Bùm. Màn hình như nổ tung. `returntof()` được gọi, `fetch('get_flag.php')` trả về, và ngay lập tức flag sáng lên ở `#flagContainer` và trong console. 

![Console - flag revealed](/images/miniCTF/FlappyBird/payload.png)

Dòng chữ tôi mong đợi hiện ra rành rọt:
```
miniCTF{d0wn_th3_r4bb1t_h0l3_w3_g0}
```
(Hình 10 chụp khoảnh khắc flag xuất hiện.)

Cảm giác — một nửa là thỏa mãn, một nửa là tội lỗi tinh tế: tôi vừa “bẻ” quy tắc chơi, nhưng đúng là tác giả đã để lộ kẽ hở — họ tin vào bảo vệ bằng số điểm, mà quên rằng client-side JavaScript luôn có thể được thao tác.

## 13. Kể lại khoảnh khắc — cinematic closure

Đèn trên bàn bật tắt, tiếng mưa ngoài cửa nhỏ lại. Tôi ngồi im một lát, nhìn dòng flag trong console như một câu trả lời cho sự tò mò: cái này là thật. Cả hành trình, từ giao diện Flappy Bird ngây thơ → fake flag lừa nhanh ở HTML → fake flag biến âm ở `script.js` → đến flag thật được khóa sau điều kiện score — tất cả tạo nên một câu chuyện có cao trào và cú twist.

Tác giả đã dựng một kịch bản: mồi giả để thử phản xạ, câu đố client-side để đo trình — và cuối cùng là một cửa hậu cho những ai chịu đào sâu. Mình lý giải: họ muốn phân biệt người chơi “copy-paste” và người chịu debug, nhưng quên rằng client-side không bao giờ là rào chắn an toàn.

## 14. Kết thúc — con chim đã hạ cánh

Sau cả hành trình:
- Từ fake flag trong HTML,
- Đến fake flag biến dạng trong `script.js`,
- Rồi điều kiện vô lý ở score 10 tỷ,
- Cuối cùng là “cheat code” qua DevTools Console,

tôi đã lấy được flag thật:
```
miniCTF{d0wn_th3_r4bb1t_h0l3_w3_g0}
```

Câu chuyện Flappy Bird khép lại như một minh họa rõ ràng: **đặt niềm tin vào client-side là một sai lầm**.  
Trong thế giới thật, bất cứ logic nào để bảo vệ secret/flag phải được xử lý server-side.  
Mọi thứ hiển thị trong HTML/JS đều chỉ là “sân chơi” — và người chơi luôn có quyền gian lận.  

> Con chim nhỏ cuối cùng cũng đã hạ cánh. Trò chơi kết thúc. Flag nằm gọn trong tay.

## Appendix — Evidence & bước tái hiện nhanh

1. Truy cập `http://103.249.117.57:6637/` → giao diện game Flappy Bird hiển thị.  
2. Mở **DevTools → Network** → `GET /` → trong response thấy một “flag” giả.  
3. Kéo xuống dòng ~65 trong response → phát hiện link tới `script.js`.  
4. Truy cập `GET /script.js` → thấy thêm một flag giả khác (`minCTF{}` thay vì `miniCTF{}`).  
5. Đọc tiếp `script.js`:  
   - **Dòng 94**: hàm `returntof()` gọi `fetch('get_flag.php')` và in flag vào `#flagContainer`.  
   - **Dòng 127**: hàm `updateScore(newScore)` có điều kiện `if (newScore >= 10000000000) returntof();`.  
6. Mở **Console** và gõ:  
   ```js
   updateScore(10000000000)
   ```
> → Hàm `returntof()` được gọi → `get_flag.php` trả về flag thật.

### Bài học bảo mật

- **Đừng để secret ở client:** Mọi dữ liệu trong HTML/JS đều có thể bị đọc, sửa hoặc gọi trực tiếp qua Console.  
- **Không kiểm tra điều kiện trên client:** Việc đặt rào cản “score >= 10 tỷ” chỉ là hình thức. Người chơi luôn có thể gọi trực tiếp hàm JavaScript.  
- **Luôn xác thực ở server-side:** Nếu muốn gắn flag với điều kiện gameplay, hãy để server tính toán và trả về, thay vì cho client quyết định.  
- **Fake flag chỉ là gia vị:** Có thể dùng để đánh lạc hướng, nhưng cần rõ ràng rằng flag thật luôn được bảo vệ bởi logic an toàn hơn.  

Kết lại, challenge “Flappy Bird” là một ví dụ thú vị để nhắc nhở: **đừng bao giờ tin vào client-side**.  

