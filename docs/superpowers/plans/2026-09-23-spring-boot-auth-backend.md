# Spring Boot Auth & Account Backend Implementation Plan

> **Mục tiêu:** Xây dựng Backend Java Spring Boot (sử dụng Java 25 & Maven 3.9.16 có sẵn trên máy) để hiện thực hóa toàn bộ module Authentication & Account Management theo đúng [API_CONTRACT.md](file:///e:/FPT/Se_5/SWP391/Horse-Training-Club/docs/API_CONTRACT.md), tích hợp hoàn chỉnh với Frontend React 19 mà không làm ảnh hưởng đến các tính năng khác về sau.

---

## 1. Kiến trúc hệ thống & Nguyên tắc Module độc lập (Modular MVC)

Để nhiều lập trình viên có thể phát triển song song (người làm Horse Profile, người làm Training, người làm Health) mà **không bị xung đột code (conflict)**:

1. **Package by Feature (Vertical Slice):**
   - Mỗi tính năng nằm trọn gói trong một package độc lập tại `com.equiflow.modules.<feature_name>` bao gồm Controller, Service, DTO, Entity, Repository riêng.
   - Các module không can thiệp vào tầng nội bộ của nhau; nếu cần dữ liệu chéo thì giao tiếp qua Service interface công khai.
2. **Chuẩn hóa REST Response:**
   - Mọi API trả về đúng cấu trúc `{ "code": "...", "message": "...", "data": { ... } }` khi lỗi, hoặc trả trực tiếp payload khi thành công, khớp 100% với Frontend Fetch Wrapper [src/shared/lib/api.ts](file:///e:/FPT/Se_5/SWP391/Horse-Training-Club/src/shared/lib/api.ts).
3. **CORS & Session Cookie:**
   - Cấu hình Spring Security cho phép `http://localhost:5173` với `allowCredentials = true`.
   - Xác thực bằng Session Cookie chuẩn trình duyệt (`HttpOnly`, `SameSite=Lax`).

---

## 2. Cấu trúc thư mục Backend đề xuất

```text
backend/
├── pom.xml
└── src/main/java/com/equiflow/
    ├── EquiFlowApplication.java
    │
    ├── common/                               # TẦNG DÙNG CHUNG
    │   ├── config/
    │   │   ├── CorsConfig.java               # CORS localhost:5173 + credentials
    │   │   └── SecurityConfig.java           # Spring Security filter chain, session cookie, 401/403 handlers
    │   ├── exception/
    │   │   ├── ApiException.java             # Exception tùy biến mang HTTP status và ErrorCode
    │   │   ├── ErrorCode.java                # Enum mã lỗi khớp API_CONTRACT.md
    │   │   └── GlobalExceptionHandler.java   # Bắt lỗi toàn cục, trả về JSON chuẩn
    │   ├── response/
    │   │   └── ApiResponse.java              # Cấu trúc lỗi: { code, message, data }
    │   └── security/
    │       ├── CustomUserDetailsService.java # Load user cho Spring Security
    │       └── SecurityUtils.java            # Lấy thông tin user hiện tại từ SecurityContext
    │
    ├── modules/                              # CÁC MODULE NGHIỆP VỤ ĐỘC LẬP
    │   ├── auth/                             # MODULE 1: AUTHENTICATION
    │   │   ├── controller/AuthController.java
    │   │   ├── dto/                          # RegisterRequest, LoginRequest, VerifyEmailRequest, ForgotPasswordRequest...
    │   │   ├── service/AuthService.java
    │   │   ├── service/OtpService.java
    │   │   └── entity/OtpToken.java
    │   │
    │   ├── account/                          # MODULE 2: ACCOUNTS & RBAC
    │   │   ├── controller/AccountController.java
    │   │   ├── dto/                          # PublicAccountDto, UpdatePermissionsRequest...
    │   │   ├── service/AccountService.java
    │   │   ├── entity/                       # User.java, Role.java, Permission.java, AuditLog.java
    │   │   └── repository/                   # UserRepository.java, RoleRepository.java, AuditLogRepository.java
    │   │
    │   ├── horse/                            # MODULE 3 [P2]: HỒ SƠ NGỰA (Sẵn sàng mở rộng, không chạm Auth)
    │   ├── training/                         # MODULE 4 [P3]: GIÁO ÁN HUẤN LUYỆN
    │   └── health/                           # MODULE 5 [P4]: SỨC KHỎE & TRAINING LOCK
    │
    └── init/
        └── DataInitializer.java              # Tự động nạp tài khoản mẫu cho 5 Actors ban đầu
```

---

## 3. Danh sách các Task triển khai chi tiết

- [x] **Task 1: Khởi tạo Project Spring Boot & cấu hình Maven (`pom.xml`)**
  - Khai báo Spring Boot 3.4.3, Java 21/25 LTS, Spring Web, Spring Security, Spring Data JPA, H2 Database (hỗ trợ chuyển đổi nhanh sang MySQL/PostgreSQL), Validation.
  - Cấu hình `application.properties`: Port `8080`, context path `/api`, H2 file-based DB `jdbc:h2:file:./data/equiflow;DB_CLOSE_DELAY=-1;AUTO_SERVER=TRUE`.
- [x] **Task 2: Xây dựng tầng hạ tầng dùng chung (`common/`)**
  - Tạo `CorsConfig` (hỗ trợ origin `http://localhost:5173` với `allowCredentials(true)`).
  - Tạo `ErrorCode` khớp 100% mã lỗi của [API_CONTRACT.md](file:///e:/FPT/Se_5/SWP391/Horse-Training-Club/docs/API_CONTRACT.md) (`INVALID_CREDENTIALS`, `EMAIL_TAKEN`, `OTP_INVALID`, `ACCOUNT_PENDING`, `ACCOUNT_LOCKED`, v.v.).
  - Tạo `GlobalExceptionHandler` trả về format JSON `{ "code": "...", "message": "...", "data": { ... } }`.
  - Tạo `SecurityConfig` với form login tắt, cấu hình session cookie và trả về mã lỗi 401 (`UNAUTHENTICATED`) / 403 (`FORBIDDEN`).
- [x] **Task 3: Thiết kế Database Entity & Data Seeder (`account/entity`)**
  - Tạo các Entity: `User`, `Role`, `UserRole`, `OtpToken`, `AuditLog`.
  - Tạo `DataInitializer` gieo sẵn dữ liệu mẫu cho cả 5 vai trò (Club Manager, Head Trainer, Veterinarian, Groom, Horse Owner) với mật khẩu `equiflow123` (băm bằng BCrypt).
- [x] **Task 4: Xây dựng Module Authentication (`modules/auth/`)**
  - Triển khai `POST /api/auth/register` (kiểm tra email `@gmail.com`, tạo tài khoản `PENDING_EMAIL`, sinh OTP 6 chữ số).
  - Triển khai `POST /api/auth/verify-email` (kiểm tra OTP, đổi status sang `PENDING_APPROVAL`, cấp mã yêu cầu `REQ-YYMM-NNN`).
  - Triển khai `POST /api/auth/login` (kiểm tra password, kiểm tra 8 trạng thái tài khoản, lưu session, trả về `user`).
  - Triển khai `GET /api/auth/me` (đọc user từ session).
  - Triển khai `POST /api/auth/logout` (hủy session).
  - Triển khai Quên mật khẩu (`/forgot-password`, `/reset-password/verify`, `/reset-password`).
- [x] **Task 5: Xây dựng Module Quản lý tài khoản (`modules/account/`)**
  - Triển khai `GET /api/accounts` (lấy danh sách tài khoản theo role/status).
  - Triển khai `POST /api/accounts/{id}/approve` (Club Manager duyệt tài khoản `PENDING_APPROVAL` sang `ACTIVE`).
  - Triển khai `POST /api/accounts/{id}/decline` (Từ chối `REJECTED`).
  - Triển khai `POST /api/accounts/{id}/lock` & `/unlock`.
  - Triển khai `PUT /api/accounts/{id}/permissions`.
- [x] **Task 6: Kiểm thử & Kết nối Frontend**
  - Build & chạy Backend với `mvn spring-boot:run` (Đang chạy ở cổng 8080).
  - Viết bộ Integration Test `AuthFlowIntegrationTest` kiểm thử tự động toàn bộ luồng Auth & Register $\rightarrow$ 100% Passed.
  - Đổi `VITE_USE_MOCK=false` trong [.env.local](file:///e:/FPT/Se_5/SWP391/Horse-Training-Club/.env.local).
  - Build frontend bằng `npm run build` $\rightarrow$ 100% Passed (0 lỗi).
