# EquiFlow FE — Hướng dẫn cho Claude Code

Hệ thống quản lý CLB đua ngựa (đồ án SWP391). File này Claude Code tự đọc mỗi phiên.
Đọc hết trước khi code.

## Tech stack
- React + TypeScript + **Next.js (App Router)** — giảng viên yêu cầu. Routing theo thư mục trong `src/app/`, không dùng react-router-dom.
- Component có state/sự kiện (useState, onClick...) phải khai báo `"use client"` ở dòng đầu file.
- Import bằng alias `@/` (trỏ tới `src/`).
- Style: CSS thuần + CSS Modules (`*.module.css`). KHÔNG Tailwind, KHÔNG UI kit ngoài.
- Không thêm thư viện mới nếu chưa hỏi ý kiến.
- Backend (làm riêng) là REST API theo MVC. FE gọi qua `src/lib/api.ts`, xác thực bằng session cookie.
- Chưa có API thì chạy bằng mock: `NEXT_PUBLIC_USE_MOCK=true` trong `.env.local` (biến phải có tiền tố `NEXT_PUBLIC_` mới đọc được ở trình duyệt).

## Ngôn ngữ
- Toàn bộ chữ trên giao diện: TIẾNG ANH.
- Comment code và commit message: tiếng Việt hoặc tiếng Anh đều được.

## Tài liệu nghiệp vụ (nguồn đúng về NGHIỆP VỤ)
Thư mục D:\Tailieu_Project:
- SRS_Phan1_Gioi_thieu_UserStory_UseCase_ERD.md — user story, use case, ERD, giá trị mặc định (OTP, mật khẩu, session...). **Khi mâu thuẫn, SRS thắng.**
- Danh_sach_uu_tien_Flow.md — thứ tự làm 7 flow (Flow 1–5 bắt buộc, Flow 6 chuồng trại và Flow 7 thi đấu đã xác nhận làm).
- Master_Prompt_SRS_Workflow_Screen.md, SWP391_Context_Document.md — bối cảnh môn học và phạm vi.
- Ngoài phạm vi: thanh toán thật, gửi email/SMS tự động, mô hình 3D, video, chat, thiết bị đo thật.

## Nguồn thiết kế (thứ tự ưu tiên)
1. Gói handoff từ Claude Design (dự án EquiFlow) — là bản CHUẨN về giao diện.
2. EquiFlow Design System — nguồn của `src/styles/tokens.css`.
3. Prototype cũ, CHỈ ĐỌC để tham khảo nội dung: `D:\Tailieu_Project\NewHorse`
   (không sửa, không đọc thư mục NewHorseWebBackup).

## Cấu trúc thư mục
src/
  app/            Next.js App Router: layout.tsx, page.tsx. MỖI ROUTE là một thư mục chứa page.tsx
                  MỎNG, chỉ re-export trang thật từ features/*/pages. Route cần quyền bọc RoleGuard.
                  Nhóm route dùng thư mục có ngoặc, ví dụ (auth)/login, (app)/accounts.
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
  components/     Dùng chung — viết trước, feature dùng lại
    layout/       AppShell, Sidebar, Topbar, RoleGuard
    ui/           Button, StatusBadge, DataTable, Modal, ConfirmModal, Toast,
                  EmptyState, LockBanner, DisabledHint (nút disable + tooltip lý do)
    form/         Field, Select, DatePicker, FileUpload, PasswordStrength
  lib/
    api.ts        Gói fetch: gắn cookie, chuyển sang mock khi NEXT_PUBLIC_USE_MOCK=true,
                  401 → mở SessionExpired, 403 → trang Forbidden403
    auth.ts       currentUser, login/logout, trạng thái phiên
    permissions.ts  Bảng vai trò → chức năng. Sidebar và RoleGuard đều đọc từ đây
    status.ts     Enum trạng thái → nhãn + class màu badge
    messages.ts   Mã lỗi từ API → câu thông báo tiếng Anh dễ hiểu
  mock/           Dữ liệu giả + handler giả lập API (accounts, horses, training...)
  types/          Kiểu dữ liệu dùng chung, khớp tên bảng DB
  styles/         tokens.css (biến màu/chữ/khoảng cách), fonts.css, global.css

## Quy tắc bắt buộc
1. Màu, cỡ chữ, bo góc, bóng: chỉ dùng biến trong tokens.css. Không hardcode hex.
2. Thành phần đã có trong components/ thì dùng lại, không viết bản mới trong feature.
3. Quyền truy cập: KHÔNG kiểm tra vai trò rải rác trong trang. Dùng permissions.ts
   + RoleGuard (chặn route) + DisabledHint (nút bị chặn: disable + giải thích, không ẩn).
4. Horse Owner chỉ thấy ngựa của mình; truy cập ngựa khác → Forbidden403.
5. Mỗi trang có đủ: loading · empty state · lỗi · trạng thái bị chặn quyền.
6. Tên ngựa luôn là link mở HorseDetail.
7. Trợ năng: label cho mọi input, focus-visible rõ, dùng được bằng bàn phím.
8. Mỗi trang mới phải có dữ liệu mock tương ứng để chạy được khi chưa có API.

## Tài khoản & trạng thái (theo SRS phần 1 + design)
- Vai trò: HEAD_TRAINER, VETERINARIAN, GROOM, HORSE_OWNER, CLUB_MANAGER.
- Trạng thái: PENDING_EMAIL, PENDING_APPROVAL, INVITED, ACTIVE, INACTIVE, REJECTED, LOCKED.
- **Đăng ký (SRS US-F1-01):** ai cũng đăng ký được, chọn vai trò MUỐN xin (4 vai trò, không có Club Manager).
  Luồng: nhập form → nhập mã OTP gửi về email → tài khoản ở trạng thái PENDING_APPROVAL → Club Manager duyệt và gán vai trò → ACTIVE.
  Club Manager chỉ do Club Manager hiện có tạo.
- **Xác minh email luôn bằng mã OTP 6 số gửi về email, KHÔNG dùng link.** OTP hết hạn sau 15 phút, dùng 1 lần, gửi lại sau 60 giây, sai tối đa 5 lần.
- **Quên mật khẩu:** nhập email → nhập OTP → đặt mật khẩu mới. Luôn trả thông báo trung tính (không lộ email có tồn tại hay không).
- **Mật khẩu:** ít nhất 8 ký tự, có chữ HOA và chữ SỐ (backend hash bcrypt).
- **Khóa đăng nhập:** sai 5 lần liên tiếp → khóa tạm 15 phút. **Phiên** hết hạn sau 30 phút không thao tác.
- Horse Owner CHỈ XEM (read-only): chỉ thấy ngựa của mình, không có nút sửa/xóa; truy cập ngựa khác → Forbidden403.
- Mock phải có ít nhất 1 tài khoản cho mỗi vai trò và mỗi trạng thái.

## Phân công
- FE1: components/ chung, auth, accounts, horses, intake, master-data (P1–P2)
- FE2: training, health (P3–P4) — cả 2 phía của Training Lock thuộc FE2
- Cả hai: dashboard (P5). P6–P7 làm nếu còn thời gian.

## Cách làm việc
- Trước khi code một phạm vi mới: liệt kê màn hình + file sẽ tạo/sửa, chờ duyệt.
- Làm xong mỗi màn: dừng cho người dùng kiểm tra.
- Chạy `npm run build` không lỗi trước khi báo xong.
