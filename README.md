# 📚 Mini Reading Tracker — Tủ Sách Cá Nhân & Theo Dõi Tiến Độ Đọc

Ứng dụng web Fullstack giúp người dùng tìm kiếm hàng triệu đầu sách từ **Open Library**, lưu vào tủ sách cá nhân và quản lý tiến độ đọc sách hàng ngày theo thời gian thực.

---

## 🔗 Liên kết Dự án & Demo

- **Frontend Demo (Live):** `https://icode-fe.vercel.app` *(hoặc URL Vercel của bạn)*
- **Backend API (Live):** `https://icode-be.onrender.com` *(hoặc URL Render của bạn)*
- **Frontend Repository:** [https://github.com/Loux666/ICODE_FE](https://github.com/Loux666/ICODE_FE)
- **Backend Repository:** [https://github.com/Loux666/ICODE_BE](https://github.com/Loux666/ICODE_BE)

---

## 📸 Demo & Giao diện (Screenshots)

> *[Chèn ảnh chụp màn hình hoặc GIF Demo tại đây]*

| Màn hình 1 — Tìm kiếm sách | Màn hình 2 — Chi tiết tác phẩm | Màn hình 3 — Tủ sách cá nhân |
| :---: | :---: | :---: |
| *(Screenshot Search Page)* | *(Screenshot Book Detail Modal)* | *(Screenshot Bookshelf Page)* |

---

## 🛠️ Công nghệ Sử dụng (Tech Stack)

### **Backend (`ICODE_BE`)**
- **Runtime & Framework:** Node.js (v20+), Express.js (v5)
- **Ngôn ngữ:** TypeScript (Strict mode)
- **Database & ORM:** MySQL 8.0 (Hosted trên Aiven Cloud), Prisma ORM
- **Validation:** Zod schema validation
- **Bảo mật & Middleware:** CORS (Cross-Origin Resource Sharing), Cookie Parser, Centralized Error Handling (`AppError`)

### **Frontend (`ICODE_FE`)**
- **Framework & Build tool:** Vue 3 (Composition API `<script setup>`), Vite
- **Ngôn ngữ:** TypeScript
- **State Management:** Pinia Store
- **Routing:** Vue Router 4
- **Design System & Styling:** Modern Clean Light Mode (Slate-50 & Indigo Palette), Vanilla Scoped CSS, Hardware-accelerated transitions
- **Icons:** `lucide-vue-next`
- **HTTP Client:** Axios

---

## 🏛️ Kiến trúc Hệ thống & Quyết định Thiết kế (Architecture & Decisions)

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Vue 3 + Vite)"]
        UI["Vue 3 SPA (Light Mode)"]
        PiniaStore["Pinia Store (Bookshelf State)"]
        AxiosClient["Axios HTTP Client"]
        UI --> PiniaStore --> AxiosClient
    end

    subgraph Server ["Backend API Gateway / Proxy Layer (Node.js + Express)"]
        Express["Express.js Server"]
        Validator["Zod Validation Middleware"]
        BookController["Book Controller"]
        OpenLibService["OpenLibrary Service (Proxy & Auto-Sync)"]
        BookshelfService["Bookshelf Service (CRUD & Stats)"]
        
        Express --> Validator --> BookController
        BookController --> OpenLibService
        BookController --> BookshelfService
    end

    subgraph Data ["Data Storage & External Services"]
        MySQL[("Aiven Cloud MySQL 8.0\n(Prisma ORM)")]
        OpenLibAPI["Open Library Public REST API\n(search.json / works.json)"]
        
        OpenLibService <-->|REST API| OpenLibAPI
        OpenLibService <-->|Cross-reference & Sync| MySQL
        BookshelfService <-->|CRUD & Aggregations| MySQL
    end

    AxiosClient -->|JSON / REST| Express
```

### **1. Mô hình Proxy Gateway (API Gateway / BFF)**
- **Frontend không bao giờ gọi trực tiếp Open Library:** Toàn bộ request tìm kiếm (`/api/books/search`) và xem chi tiết (`/api/books/works/:id`) đều đi qua backend.
- **Tích hợp kiểm tra chéo (Cross-referencing):** Khi tìm kiếm sách từ Open Library, backend tự động đối chiếu với cơ sở dữ liệu MySQL để gắn cờ `isInBookshelf: true/false` và trạng thái đọc hiện tại trước khi trả về cho Frontend.

### **2. Chiến lược Lưu trữ Snapshot & Lazy Auto-Sync**
- Khi người dùng thêm sách vào tủ, backend lưu **Bản snapshot thông tin sách** (`workId`, `title`, `author`, `coverUrl`, `publishYear`, `description`, `subjects`) cùng **Dữ liệu cá nhân** (`status`, `currentPage`, `rating`, `notes`).
- Khi người dùng mở xem chi tiết một cuốn sách đã có trong tủ, backend thực hiện **Lazy Auto-Sync** (cập nhật ngầm mô tả hoặc ảnh bìa mới nhất từ Open Library vào MySQL mà không làm gián đoạn trải nghiệm người dùng).

---

## 🗄️ Thiết kế Cơ sở Dữ liệu (Database Schema & ERD)

```mermaid
erDiagram
    BOOK {
        int id PK "Tự tăng (Auto Increment)"
        string workId UK "Mã tác phẩm Open Library (Unique)"
        string title "Tên sách"
        string author "Tên tác giả"
        string coverUrl "Đường dẫn ảnh bìa"
        int publishYear "Năm xuất bản"
        int totalPages "Tổng số trang"
        text description "Tóm tắt nội dung"
        text subjects "Chủ đề / Thể loại (JSON Array String)"
        enum status "WANT_TO_READ | READING | COMPLETED"
        int currentPage "Số trang đã đọc (>= 0)"
        int rating "Điểm đánh giá (1-5 sao hoặc null)"
        text notes "Ghi chú / cảm nhận cá nhân"
        datetime startDate "Ngày bắt đầu chuyển sang READING"
        datetime finishDate "Ngày đọc xong (COMPLETED)"
        datetime createdAt "Thời gian tạo"
        datetime updatedAt "Thời gian cập nhật gần nhất"
    }
```

---

## 📡 Danh sách API Endpoints (API Documentation)

Mọi API đều trả về cấu trúc JSON chuẩn:
```json
{
  "success": true,
  "data": { ... },
  "message": "Thông báo (tùy chọn)"
}
```

### **1. Sách & Open Library Proxy**
| Method | Endpoint | Query / Param | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/books/search` | `?q=keyword&page=1&limit=20` | Tìm kiếm sách từ Open Library, đối chiếu cờ `isInBookshelf` |
| `GET` | `/api/books/works/:workId` | `:workId` (e.g. `OL82563W`) | Xem chi tiết tác phẩm (kèm Fallback & Auto-sync ngầm) |

### **2. Tủ sách cá nhân (Bookshelf)**
| Method | Endpoint | Body / Param | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/bookshelf` | `?status=READING&search=...` | Lấy danh sách tủ sách, lọc theo tab & tìm kiếm nội bộ |
| `GET` | `/api/bookshelf/stats` | Không | Lấy thống kê: tổng số sách, đang đọc, đã đọc xong, tổng trang đã đọc, rating TB |
| `POST` | `/api/bookshelf` | JSON `AddBookPayload` | Thêm sách vào tủ (chống trùng `409 Conflict`, set status ban đầu) |
| `PUT` | `/api/bookshelf/:id` | JSON `UpdateBookPayload` | Cập nhật tiến độ trang, đổi trạng thái đọc, chấm điểm sao, ghi chú |
| `DELETE`| `/api/bookshelf/:id` | `:id` (ID sách trong DB) | Xóa sách khỏi tủ cá nhân |

---

## ⚙️ Các Quy tắc Nghiệp vụ (Business Rules Compliance)

| # | Quy tắc nghiệp vụ | Cách triển khai trong mã nguồn |
| :-: | :--- | :--- |
| **1** | **Chống trùng lặp sách** | Kiểm tra `workId` trước khi tạo, ném lỗi `409 Conflict` nếu đã tồn tại. |
| **2** | **Ràng buộc số trang** | Kiểm tra $0 \le \text{currentPage} \le \text{totalPages}$. Nếu vượt quá $\rightarrow$ ném lỗi `400 Bad Request`. |
| **3** | **Đánh giá sao** | Điểm đánh giá giới hạn trong đoạn $[1, 5]$ số nguyên, hoặc `null`. |
| **4** | **Tự động chuyển trạng thái** | Khi $\text{currentPage} == \text{totalPages} > 0 \rightarrow$ tự động chuyển trạng thái sang `COMPLETED` (`Đã đọc`). |
| **5** | **Ghi nhận mốc thời gian** | - Khi chuyển sang `READING` lần đầu $\rightarrow$ ghi nhận `startDate`.<br>- Khi chuyển sang `COMPLETED` $\rightarrow$ ghi nhận `finishDate`. |
| **6** | **Validation dữ liệu** | Sử dụng Zod schema middleware chuẩn hóa, bắt lỗi tập trung và trả về danh sách lỗi cụ thể (`field`, `message`). |

---

## 💻 Hướng dẫn Cài đặt & Chạy Local (Local Development)

### **1. Yêu cầu môi trường**
- Node.js $\ge$ 18.x
- npm $\ge$ 9.x
- Kết nối Internet (để kết nối Aiven MySQL và Open Library)

### **2. Cài đặt Backend (`Express_Base`)**
```bash
# 1. Di chuyển vào thư mục backend
cd Express_Base

# 2. Cài đặt dependencies
npm install

# 3. Tạo file cấu hình môi trường .env
cp .env.example .env
# Cấu hình chuỗi DATABASE_URL của MySQL (hoặc dùng Aiven DB có sẵn)

# 4. Sinh Prisma Client & Seed dữ liệu mẫu ban đầu
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. Khởi chạy Server ở chế độ Development
npm run dev
# Server lắng nghe tại: http://localhost:3000
```

### **3. Cài đặt Frontend (`Base-Vue`)**
```bash
# 1. Mở một terminal khác và di chuyển vào thư mục frontend
cd Base-Vue

# 2. Cài đặt dependencies
npm install

# 3. Cấu hình file .env
echo "VITE_API_URL=http://localhost:3000/api" > .env

# 4. Khởi chạy Frontend Dev Server
npm run dev
# Mở trình duyệt tại: http://localhost:5173
```

---

## 🚀 Hướng dẫn Deploy lên Môi trường Cloud

### **1. Database (MySQL trên Aiven Cloud)**
- Tạo một MySQL Service miễn phí trên [Aiven.io](https://aiven.io).
- Lấy chuỗi kết nối dạng:
  `DATABASE_URL=mysql://avnadmin:PASSWORD@HOST:PORT/defaultdb?ssl-mode=REQUIRED`

### **2. Backend trên Render.com**
- Tạo **New Web Service** trỏ tới repository `ICODE_BE`.
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `DATABASE_URL`: `[Chuỗi kết nối Aiven MySQL]`
  - `PORT`: `3000`

### **3. Frontend trên Vercel.com**
- Tạo **New Project** trỏ tới repository `ICODE_FE`.
- **Framework Preset:** `Vite`
- **Environment Variables:**
  - `VITE_API_URL`: `https://your-backend-api.onrender.com/api`

---

## 💡 Giả định, Hạn chế & Hướng Cải thiện (Future Improvements)

### **Giả định & Hạn chế:**
- Ứng dụng thiết kế cho một người dùng (*single-user mode*), chưa có hệ thống Authentication (JWT/OAuth2) để phân tách tủ sách của nhiều tài khoản khác nhau.
- Tốc độ tìm kiếm Open Library phụ thuộc vào phản hồi của máy chủ công cộng Open Library (Mỹ).

### **Hướng cải thiện nếu có thêm thời gian:**
1. **Caching Layer:** Tích hợp Redis để cache kết quả tìm kiếm sách và chi tiết tác phẩm thường truy cập, giảm tải cho Open Library API.
2. **Đa người dùng (Multi-tenancy):** Thêm chức năng Đăng ký / Đăng nhập (JWT + OAuth Google/GitHub) để mỗi người dùng có tủ sách riêng.
3. **Mục tiêu đọc sách năm (Reading Goal Challenge):** Thêm biểu đồ tiến độ đọc theo tháng/năm và đặt mục tiêu số cuốn sách cần đọc trong năm.
4. **PWA & Offline Mode:** Hỗ trợ Progressive Web App để người dùng có thể xem và cập nhật tiến độ đọc ngay cả khi mất mạng.
