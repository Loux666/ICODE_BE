# 📚 Mini Reading Tracker — Bài test Fullstack

> Xây dựng một ứng dụng web nhỏ giúp người dùng tìm sách, lưu vào tủ sách cá nhân và theo dõi tiến độ đọc, sử dụng public API **Open Library** (thuộc danh sách *public-apis* — mục Books).  
> 💡 *Ứng viên có thể liên hệ HR để nhận VPS cho việc testing và deploy miễn phí.*

---

## 1. Thông tin chung

| Hạng mục | Yêu cầu |
| :--- | :--- |
| **Frontend** | Vue.js |
| **Backend** | Node.js |
| **Database** | MySQL |
| **Public API** | [Open Library](https://openlibrary.org/developers/api) — miễn phí, không cần API key |
| **Thời gian** | 3–5 ngày kể từ khi nhận đề |
| **Số màn hình** | 3 màn hình *(có thể gộp màn chi tiết thành modal)* |
| **Deploy** | **Bắt buộc** — ứng dụng phải truy cập được qua URL public |

*Ứng viên tự quyết định kiến trúc, cấu trúc thư mục, thiết kế database, thiết kế API và các thư viện sử dụng.*

---

## 2. Mô tả chức năng

### 🖥️ Màn hình 1 — Tìm kiếm sách (Trang chủ)
- Ô tìm kiếm theo **tên sách** hoặc **tác giả**.
- Hiển thị kết quả dạng lưới/danh sách:
  - Ảnh bìa
  - Tên sách
  - Tác giả
  - Năm xuất bản
- **Phân trang** kết quả.
- Mỗi sách có nút `+ Thêm vào tủ`:
  - Nếu sách đã có trong tủ $\rightarrow$ hiển thị badge `Đã thêm`.
- Hiển thị đầy đủ trạng thái: **loading**, **không có kết quả (empty)**, **lỗi (error)**.

### 📖 Màn hình 2 — Chi tiết sách
- **Hiển thị thông tin:** Ảnh bìa, tên sách, tác giả, mô tả, số trang, chủ đề (*subjects*), năm xuất bản.
- **Tương tác:** Cho phép thêm vào tủ và chọn trạng thái ban đầu:
  - `Muốn đọc`
  - `Đang đọc`
  - `Đã đọc`

### 📚 Màn hình 3 — Tủ sách của tôi
- **3 tab lọc theo trạng thái:** `Muốn đọc` / `Đang đọc` / `Đã đọc`.
- **Thống kê nhanh phía trên:**
  - Tổng số sách
  - Số sách đang đọc
  - Số sách đã đọc xong
- **Với mỗi cuốn sách:**
  - Thanh tiến độ `%` $(\frac{\text{số trang đang đọc}}{\text{tổng số trang}} \times 100\%)$.
  - Cập nhật số trang đang đọc.
  - Đổi trạng thái đọc.
  - Chấm điểm **1–5 sao** và ghi chú ngắn.
  - Xoá sách khỏi tủ *(có popup/hộp thoại xác nhận)*.

> [!NOTE]
> **Không yêu cầu đăng nhập** — ứng dụng dành cho một người dùng (*single user*).

---

## 3. Public API sử dụng

| Mục đích | Endpoint / URL |
| :--- | :--- |
| **Tìm sách** | `GET https://openlibrary.org/search.json?q={keyword}&page={n}&limit=20` |
| **Chi tiết tác phẩm** | `GET https://openlibrary.org/works/{workId}.json` |
| **Ảnh bìa** | `https://covers.openlibrary.org/b/id/{coverId}-M.jpg` |

- **Tài liệu đầy đủ:** [https://openlibrary.org/developers/api](https://openlibrary.org/developers/api)

> [!WARNING]
> **Frontend KHÔNG được gọi trực tiếp Open Library.** Mọi request phải đi qua backend của ứng viên làm trung gian (proxy / API gateway). Dữ liệu tủ sách phải được lưu trong MySQL.

---

## 4. Quy tắc nghiệp vụ (Business Rules)

1. **Chống trùng lặp:** Không cho thêm trùng sách vào tủ $\rightarrow$ trả về mã lỗi `409 Conflict`.
2. **Ràng buộc số trang:** $0 \le \text{Số trang đang đọc} \le \text{Tổng số trang của sách}$.
3. **Đánh giá:** Điểm đánh giá là số nguyên từ $1$ đến $5$ *(hoặc để trống / null)*.
4. **Tự động chuyển trạng thái:** Khi $\text{Số trang đang đọc} = \text{Tổng số trang}$ $\rightarrow$ tự động chuyển trạng thái sang `Đã đọc`.
5. **Ghi nhận mốc thời gian:**
   - Khi sách chuyển sang `Đang đọc` lần đầu $\rightarrow$ ghi nhận **ngày bắt đầu đọc** (`startDate`).
   - Khi sách chuyển sang `Đã đọc` $\rightarrow$ ghi nhận **ngày đọc xong** (`finishDate`).
6. **Validation:** Dữ liệu đầu vào phải được validate ở backend; lỗi trả về theo một format thống nhất và có thông báo rõ ràng.

---

## 5. 🚀 Yêu cầu Deploy (Bắt buộc)

Ứng viên phải deploy cả **Frontend**, **Backend** và **Database** lên môi trường public để người chấm có thể truy cập và test trực tiếp.  
*(Ứng viên có thể liên hệ HR để nhận VPS cho việc testing và deploy miễn phí).*

### Nền tảng gợi ý (chọn bất kỳ)

| Thành phần | Lựa chọn gợi ý |
| :--- | :--- |
| **Frontend** | Vercel, Cloudflare Pages, Netlify, GitHub Pages, VPS (Nginx) |
| **Backend** | Render, Railway, Fly.io, Koyeb, VPS (PM2 + Nginx / Docker) |
| **MySQL** | Railway, Aiven, TiDB Cloud Serverless, Clever Cloud, VPS (MySQL tự cài / Docker) |

> [!TIP]
> Có thể deploy toàn bộ trên 1 VPS (VPS được HR cấp hoặc VPS cá nhân), hoặc kết hợp nhiều dịch vụ miễn phí (vd: Vercel + Render + Aiven).  
> *Lưu ý: Cloudflare Workers / Vercel Functions không chạy Express truyền thống một cách trực tiếp — nếu dùng serverless cho backend, cần điều chỉnh code phù hợp.*

### Yêu cầu tối thiểu
- [ ] Ứng dụng truy cập được qua **HTTPS**.
- [ ] Thông tin nhạy cảm (DB credentials, secret keys…) **không** được commit lên repo.
- [ ] Có **dữ liệu mẫu (seed data)** để người chấm xem và test được ngay.
- [ ] Ứng dụng hoạt động ổn định trong ít nhất **7 ngày** sau khi nộp bài.

---

## 6. Sản phẩm cần nộp

1. **Link repository** (GitHub / GitLab — public hoặc cấp quyền cho người chấm), commit history rõ ràng.
2. **Link demo:**
   - Frontend URL: `https://...`
   - Backend URL: `https://...`
3. **README của project**, bao gồm:
   - Giới thiệu ngắn & ảnh chụp màn hình (hoặc GIF demo).
   - Danh sách công nghệ sử dụng.
   - Hướng dẫn cài đặt và chạy local.
   - Mô tả kiến trúc & sơ đồ Database (ERD).
   - Danh sách API (hoặc link Swagger / Postman collection).
   - Mô tả cách đã deploy (nền tảng nào, các bước thực hiện, cấu hình).
   - Các giả định, hạn chế và hướng cải thiện nếu có thêm thời gian.

---

## 7. Lưu ý quan trọng

- Được phép sử dụng thư viện bên thứ ba và AI hỗ trợ, nhưng ứng viên **phải hiểu và giải thích được toàn bộ code cũng như các quyết định thiết kế** trong buổi phỏng vấn.
- Nếu một phần chưa hoàn thành, hãy **ghi rõ trong README** — sự trung thực được đánh giá cao hơn làm đối phó/làm cho có.

🎉 *Chúc bạn làm bài tốt!*
