# HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY DỰ ÁN EQUIFLOW (TMEC)

Tài liệu này hướng dẫn chi tiết dành cho các thành viên trong nhóm sau khi clone dự án về máy. Hãy làm theo đúng từng bước để chạy cả **Backend (Spring Boot)** và **Frontend (React 19)** một cách trơn tru nhất.

---

## I. CÔNG NGHỆ CẦN TẢI & CÀI ĐẶT TRƯỚC (PREREQUISITES)

Trước khi bắt đầu, máy tính của bạn cần được cài đặt sẵn các công cụ sau:

| Công cụ | Phiên bản yêu cầu | Mục đích | Link tải / Lệnh kiểm tra |
|---|---|---|---|
| **Git** | Bản mới nhất | Quản lý mã nguồn | Kiểm tra: `git --version` |
| **Node.js & npm** | `Node >= 20.19.0`, `npm >= 10.x` | Chạy Frontend React 19 + Vite | [Tải Node.js LTS](https://nodejs.org/)<br/>Kiểm tra: `node -v` và `npm -v` |
| **Java JDK** | `JDK 21` hoặc `JDK 25 LTS` | Chạy Backend Spring Boot 3.4 | [Tải Oracle JDK](https://www.oracle.com/java/technologies/downloads/) hoặc OpenJDK<br/>Kiểm tra: `java -version` và `javac -version` |
| **Apache Maven** | `Maven >= 3.9.x` | Build và quản lý thư viện Java | [Tải Apache Maven](https://maven.apache.org/download.cgi)<br/>Kiểm tra: `mvn -v` |
| **Trình soạn thảo (IDE)** | VS Code hoặc IntelliJ IDEA | Viết code FE & BE | [VS Code](https://code.visualstudio.com/) / [IntelliJ IDEA](https://www.jetbrains.com/idea/) |

> [!NOTE]
> **Đảm bảo biến môi trường (Environment Variables):**
> Sau khi cài Java và Maven, hãy chắc chắn rằng lệnh `java -version` và `mvn -v` có thể chạy được ở bất kỳ cửa sổ CMD / PowerShell nào.

---

## II. HƯỚNG DẪN CÁC BƯỚC CHẠY DỰ ÁN

Quy trình chuẩn gồm 2 phần độc lập: **Backend** (cổng 8080) và **Frontend** (cổng 5173).

```text
Thư mục dự án: Horse-Training-Club/
├── backend/            <-- Terminal 1: Chạy Backend Spring Boot (cổng 8080)
└── src/ (thư mục gốc)  <-- Terminal 2: Chạy Frontend React Vite (cổng 5173)
```

---

### BƯỚC 1: Tải mã nguồn về máy

Mở **Command Prompt (CMD)** hoặc **PowerShell**, gõ lệnh:

```bash
git clone https://github.com/MinhMQ1711/Horse-Training-Club.git
cd Horse-Training-Club
```

---

### BƯỚC 2: Khởi động Backend (Spring Boot)

Hệ thống đã tích hợp sẵn cơ sở dữ liệu nhúng H2 (lưu tại `./data/equiflow`), tự động tạo bảng và nạp sẵn dữ liệu tài khoản mẫu nên **bạn không cần cài MySQL hay PostgreSQL trước**.

1. Mở cửa sổ **Terminal / PowerShell thứ nhất**.
2. Di chuyển vào thư mục `backend`:
   ```powershell
   cd backend
   ```
3. Chạy lệnh khởi động Spring Boot:
   ```powershell
   mvn spring-boot:run
   ```
4. **Dấu hiệu thành công:** Khi terminal xuất hiện dòng chữ:
   ```text
   Tomcat started on port 8080 (http) with context path '/api'
   Started EquiFlowApplication in ... seconds
   ```
   *👉 Backend API đã sẵn sàng tại:* `http://localhost:8080/api`  
   *👉 Trang quản lý Database H2 Console (tùy chọn):* `http://localhost:8080/api/h2-console` (JDBC URL: `jdbc:h2:file:./data/equiflow`, User: `sa`, Password: để trống).

---

### BƯỚC 3: Khởi động Frontend (React 19 + Vite)

1. Mở cửa sổ **Terminal / PowerShell thứ hai** (tại thư mục gốc của dự án `Horse-Training-Club`).
2. Tạo file biến môi trường cục bộ `.env.local`:
   - **Trên Windows PowerShell:**
     ```powershell
     Copy-Item .env.example .env.local
     ```
   - **Trên macOS / Linux:**
     ```bash
     cp .env.example .env.local
     ```
   *(Mặc định `.env.local` đã cấu hình `VITE_USE_MOCK=false` và `VITE_API_URL=http://localhost:8080/api` để kết nối thẳng với Backend Java).*

3. Cài đặt các thư viện Node.js:
   ```powershell
   npm install
   ```

4. Khởi chạy máy chủ phát triển Frontend:
   ```powershell
   npm run dev
   ```

5. **Dấu hiệu thành công:**
   ```text
   VITE v8.3.0  ready in ... ms

   ➜  Local:   http://localhost:5173/
   ```

Mở trình duyệt truy cập: **`http://localhost:5173`** 🎉

---

## III. TÀI KHOẢN DÙNG THỬ & KỊCH BẢN TEST

Backend đã tự động tạo sẵn các tài khoản demo đại diện cho 5 vai trò.

### 1. Bảng tài khoản mẫu

| Email | Mật khẩu | Vai trò (Role) | Chức năng có thể xem |
|---|---|---|---|
| `viet.do@gmail.com` | `equiflow123` | **Club Manager** | Quản lý toàn bộ danh sách tài khoản, phê duyệt, khóa, phân quyền. |
| `Minhmaiki@gmail.com` | `123456` | **Club Manager** | Tài khoản quản trị dự phòng. |
| `nam.tran@gmail.com` | `equiflow123` | **Head Trainer** | Menu Huấn luyện (vào `/accounts` sẽ nhận trang 403 Forbidden). |
| `chau.le@gmail.com` | `equiflow123` | **Veterinarian** | Menu Y tế & Khóa huấn luyện. |
| `ha.ly@gmail.com` | `equiflow123` | **Horse Owner** | Menu Chủ ngựa (chỉ thấy ngựa của mình). |
| `binh.pham@gmail.com` | `equiflow123` | **Groom** | Tài khoản bị khóa (thử đăng nhập để xem thông báo khóa tài khoản). |
| `anh.nguyen@gmail.com` | `equiflow123` | **Horse Owner** | Tài khoản đang chờ duyệt (thử đăng nhập để xem thông báo chờ duyệt). |

> [!TIP]
> Trong môi trường dev, bất kỳ khi nào hệ thống yêu cầu mã **OTP xác minh** (đăng ký tài khoản, quên mật khẩu), bạn luôn có thể nhập mã: **`123456`**.

---

### 2. Kịch bản test luồng Đăng ký & Phê duyệt Chủ ngựa

1. Tại màn hình Đăng nhập `http://localhost:5173/login`, bấm **"Request an account"**.
2. Nhập họ tên, email (bắt buộc đuôi `@gmail.com`), mật khẩu $\rightarrow$ Bấm **Request account**.
3. Nhập mã OTP: **`123456`** $\rightarrow$ Hệ thống chuyển sang màn hình **Waiting for approval** (Chờ duyệt).
4. Mở cửa sổ ẩn danh (hoặc đăng xuất), đăng nhập bằng tài khoản Quản lý CLB: `viet.do@gmail.com` / `equiflow123`.
5. Vào menu **Accounts** $\rightarrow$ Tab **Pending** $\rightarrow$ Bấm nút **Approve** cho tài khoản vừa tạo.
6. Đăng nhập bằng tài khoản Chủ ngựa mới $\rightarrow$ Vào trang Dashboard thành công!

---

## IV. CÁC LỆNH HỮU ÍCH

| Lệnh | Thư mục chạy | Tác dụng |
|---|---|---|
| `mvn spring-boot:run` | `backend/` | Chạy Backend Spring Boot |
| `mvn test` | `backend/` | Chạy bộ kiểm thử tự động Backend (Integration tests) |
| `mvn clean compile` | `backend/` | Kiểm tra biên dịch Java |
| `npm run dev` | Thư mục gốc | Chạy Frontend Vite |
| `npm run build` | Thư mục gốc | Kiểm tra lỗi kiểu TypeScript và đóng gói Frontend |
| `npm run lint` | Thư mục gốc | Kiểm tra lỗi code chuẩn với Oxlint |

---

## V. XỬ LÝ LỖI THƯỜNG GẶP (TROUBLESHOOTING)

#### 1. Lỗi cổng 8080 hoặc 5173 bị chiếm dụng (`Port already in use`)
- Nguyên nhân: Có một tiến trình Java hoặc Node khác đang chạy ngầm trên máy.
- Khắc phục trên Windows PowerShell:
  ```powershell
  # Tìm PID đang chiếm cổng 8080
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
  ```

#### 2. Lỗi `mvn` hoặc `javac` không nhận lệnh
- Nguyên nhân: Chưa thêm thư mục `bin` của Java và Maven vào biến môi trường `Path` của Windows.
- Khắc phục: Vào `System Properties` $\rightarrow$ `Environment Variables` $\rightarrow$ Thêm đường dẫn JDK/bin và Maven/bin vào biến `Path`, sau đó khởi động lại Terminal.

#### 3. Chuyển đổi giữa chế độ Mock và Backend thật
- Mở file `.env.local`:
  - `VITE_USE_MOCK=false`: Gọi trực tiếp tới Backend Spring Boot (khuyên dùng).
  - `VITE_USE_MOCK=true`: Chạy dữ liệu giả lập lưu trong trình duyệt (dùng khi không muốn bật Backend).
