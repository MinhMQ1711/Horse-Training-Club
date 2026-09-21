# EquiFlow FE — Hướng dẫn cho Claude Code

Hệ thống quản lý CLB đua ngựa (đồ án SWP391). File này Claude Code tự đọc mỗi phiên.
Đọc hết trước khi code.

## Tech stack
- React + TypeScript + **Vite** (single-page app) + **React Router**. Routing nằm trong MỘT bảng duy nhất: `src/app/router.tsx`. Không có routing theo thư mục.
- Điểm khởi động: `index.html` → `src/main.tsx`. Chuyển trang bằng `Link` và `useNavigate` của `react-router-dom`.
- Import bằng alias `@/` (trỏ tới `src/`).
- Style: CSS thuần + CSS Modules (`*.module.css`). KHÔNG Tailwind, KHÔNG UI kit ngoài.
- Không thêm thư viện mới nếu chưa hỏi ý kiến.
- Backend (làm riêng) là REST API theo MVC. FE gọi qua `src/shared/lib/api.ts`, xác thực bằng session cookie.
- Chưa có API thì chạy bằng mock: `VITE_USE_MOCK=true` trong `.env.local` (biến phải có tiền tố `VITE_` mới đọc được ở trình duyệt; đọc bằng `import.meta.env`).

## Ngôn ngữ
- Toàn bộ chữ trên giao diện: TIẾNG ANH.
- Comment code và commit message: tiếng Việt hoặc tiếng Anh đều được.

## Nguồn thiết kế (thứ tự ưu tiên)
1. Gói handoff từ Claude Design (dự án EquiFlow) — là bản CHUẨN về giao diện.
2. EquiFlow Design System — nguồn của `src/shared/styles/tokens.css`.
3. Prototype cũ, CHỈ ĐỌC để tham khảo nội dung: `D:\Tailieu_AI\NewHorse\NewHorse`
   (không sửa, không đọc thư mục NewHorseWebBackup).

## Cấu trúc thư mục
src/
  main.tsx        Điểm khởi động: nạp CSS toàn cục và dựng React vào #root
  app/            router.tsx = bảng route DUY NHẤT (URL → trang thật trong features/*/pages).
                  Trang sau đăng nhập nằm trong AppLayout (AppShell + RoleGuard). Thêm màn = thêm một dòng vào bảng.
  features/       Chia theo NGHIỆP VỤ (flow), không chia theo vai trò
    auth/         P1  Landing, Login, SignUp, VerifyEmail, ForgotPassword,
                      ResetPassword, AcceptInvite, MyProfile, Forbidden403, SessionExpired
    accounts/     P1  AccountList, InviteStaff, PermissionMatrix
    horses/       P2  HorseList, HorseDetail (tabs), HorseForm, PedigreeEditor, AssignOwner
    intake/       P2  HorseIntake, BoardingRequests, OwnerPendingHome
    master-data/  P2  StaffDirectory, SuppliesCatalog, StallMap
    training/     P3  PlanList, PlanWizard, TrainingCalendar, TrialRuns,
                      SessionMetrics, PlanHistory, LiveMonitor, AlertList
    health/       P4  HerdHealth, MedicalRecords, Treatments, InjuryMap,
                      TrainingLock, CareSchedule
    dashboard/    P5  TrainerDashboard, ManagerDashboard, OwnerReport, AuditLog
    stable/       P6  (optional) Groom: routine, rations, tasks, incidents, supplies
    racing/       P7  (optional) RaceEntry, RaceResults
    Mỗi feature gồm: pages/  components/  api.ts  types.ts
    Khung thư mục đã tạo sẵn với file RỖNG. CHỈ viết nội dung một file khi người dùng yêu cầu code màn/chức năng đó.
  shared/         DÙNG CHUNG cho mọi feature — viết trước, feature dùng lại
    components/
      layout/     AppShell, Sidebar, Topbar, RoleGuard
      ui/         Button, StatusBadge, DataTable, Modal, ConfirmModal, Toast,
                  EmptyState, LockBanner, DisabledHint (nút disable + tooltip lý do)
      form/       Field, Select, DatePicker, FileUpload, PasswordStrength
    lib/
      api.ts      Gói fetch: gắn cookie, chuyển sang mock khi VITE_USE_MOCK=true,
                  401 → mở SessionExpired, 403 → trang Forbidden403
      auth.ts     currentUser, login/logout, trạng thái phiên
      permissions.ts  Bảng vai trò → chức năng. Sidebar và RoleGuard đều đọc từ đây
      status.ts   Enum trạng thái → nhãn + class màu badge
      messages.ts Mã lỗi từ API → câu thông báo tiếng Anh dễ hiểu
    mock/         Dữ liệu giả + handler giả lập API (accounts, horses, training...)
    types/        Kiểu dữ liệu dùng chung, khớp tên bảng DB
    styles/       tokens.css (biến màu/chữ/khoảng cách), fonts.css, global.css
  Quy tắc phụ thuộc: app → features → shared. features KHÔNG import lẫn nhau.
  Tài liệu: README.md (tổng quan), docs/ARCHITECTURE.md (sơ đồ), docs/API_CONTRACT.md,
  docs/PROJECT_GUIDE.md (giải thích từng thư mục), docs/HUONG_DAN_HOC.md (học + vấn đáp).

## Quy tắc bắt buộc
1. Màu, cỡ chữ, bo góc, bóng: chỉ dùng biến trong tokens.css. Không hardcode hex.
2. Thành phần đã có trong shared/components/ thì dùng lại, không viết bản mới trong feature.
3. Quyền truy cập: KHÔNG kiểm tra vai trò rải rác trong trang. Dùng shared/lib/permissions.ts
   + RoleGuard (chặn route) + DisabledHint (nút bị chặn: disable + giải thích, không ẩn).
4. Horse Owner chỉ thấy ngựa của mình; truy cập ngựa khác → Forbidden403.
5. Mỗi trang có đủ: loading · empty state · lỗi · trạng thái bị chặn quyền.
6. Tên ngựa luôn là link mở HorseDetail.
7. Trợ năng: label cho mọi input, focus-visible rõ, dùng được bằng bàn phím.
8. Mỗi trang mới phải có dữ liệu mock tương ứng để chạy được khi chưa có API.

## Tài khoản & trạng thái (khớp thiết kế)
- Vai trò: HEAD_TRAINER, VETERINARIAN, GROOM, HORSE_OWNER, CLUB_MANAGER.
- Trạng thái: PENDING_EMAIL, PENDING_INTAKE, INVITED, ACTIVE, INACTIVE, REJECTED, LOCKED.
- Sign Up chỉ cho Horse Owner. Nhân viên được Club Manager mời qua email.
- Owner chỉ ACTIVE khi đã gắn ≥ 1 ngựa (qua màn Horse Intake).
- Forgot Password luôn trả thông báo trung tính.
- **Xác minh email luôn bằng mã OTP gửi về email, KHÔNG dùng link.** Forgot Password = nhập email → nhập OTP → đặt mật khẩu mới. Design Claude Design còn ghi "reset link" thì sửa theo quy tắc này.
- Mock phải có ít nhất 1 tài khoản cho mỗi vai trò và mỗi trạng thái.

## Phân công
- FE1: components/ chung, auth, accounts, horses, intake, master-data (P1–P2)
- FE2: training, health (P3–P4) — cả 2 phía của Training Lock thuộc FE2
- Cả hai: dashboard (P5). P6–P7 làm nếu còn thời gian.

## Cách làm việc
- Trước khi code một phạm vi mới: liệt kê màn hình + file sẽ tạo/sửa, chờ duyệt.
- Làm xong mỗi màn: dừng cho người dùng kiểm tra.
- Chạy `npm run build` không lỗi trước khi báo xong.
