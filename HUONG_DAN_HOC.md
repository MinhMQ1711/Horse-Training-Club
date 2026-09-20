# Hướng dẫn học: hiểu và bảo vệ code của EquiFlow FE (Priority 1)

File này viết cho **người đã không tự gõ phần code này** nhưng phải **hiểu để tự sửa và trả lời vấn đáp**.
Đọc theo thứ tự. Mỗi phần có: *nó là gì* → *nằm ở file nào* → *câu hỏi thầy có thể hỏi*.

> Phạm vi đã làm: Phase 0 (đăng nhập) và Priority 1 (đăng ký, OTP, quên mật khẩu, khung app, phân quyền RBAC,
> danh sách tài khoản, quyền từng tài khoản, 403, hết phiên, hồ sơ, đổi mật khẩu) — 16 route.

---

## 0. Chạy thử và tài khoản demo

```bash
npm install
cp .env.example .env.local        # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev                        # mở http://localhost:3000
```

Mọi tài khoản đều có mật khẩu **`equiflow123`**. Mã OTP demo luôn là **`123456`**.

| Email | Vai trò | Trạng thái | Thử để thấy gì |
|---|---|---|---|
| `viet.do@equiflow.vn` | Club Manager | ACTIVE | Vào được Accounts và Permissions |
| `nam.tran@equiflow.vn` | Head Trainer | ACTIVE | Sidebar huấn luyện; gõ `/accounts` → **403** |
| `chau.le@equiflow.vn` | Veterinarian | ACTIVE | Sidebar y tế |
| `ha.ly@equiflow.vn` | Horse Owner | ACTIVE | Sidebar chủ ngựa |
| `binh.pham@equiflow.vn` | Groom | **LOCKED** | Đăng nhập → thông báo bị khóa, nút bị chặn có tooltip |
| `anh.nguyen@equiflow.vn` | Horse Owner | **PENDING_APPROVAL** | Đăng nhập → "chờ duyệt" |
| `ngoc.trinh@equiflow.vn` | Horse Owner | PENDING_EMAIL | Đăng nhập → "chưa xác minh email" |
| `huy.hoang@equiflow.vn` | Horse Owner | PENDING_INTAKE | "Chờ tiếp nhận ngựa" |
| `tung.ngo@equiflow.vn` | Groom | INVITED | "Chưa nhận lời mời" |
| `khang.dang@equiflow.vn` | Veterinarian | INACTIVE | "Tài khoản ngưng hoạt động" |
| `trang.bui@equiflow.vn` | Horse Owner | REJECTED | "Yêu cầu bị từ chối" |

Bài thử hay nhất để hiểu RBAC:
1. Đăng nhập Club Manager → Accounts → **Permissions** của Trần Văn Nam → tắt "Create and edit Training Plans" → xác nhận → Save.
2. Đăng xuất, đăng nhập Nam → mục **Training Plans biến mất** khỏi sidebar. Gõ `/plans` → trang **403**.

Dữ liệu giả nằm trong `localStorage` của trình duyệt. Muốn về dữ liệu ban đầu: DevTools → Application → xóa key `equiflow.mock.db.v1`.
Thêm `?mockError=1` vào URL `/accounts` để xem trạng thái lỗi tải danh sách.

---

## 1. Bức tranh lớn: một lần đăng nhập đi qua những đâu

```
LoginPage (features/auth/pages)         ← giao diện + kiểm tra ô nhập
   │ gọi signIn(...)
   ▼
AuthProvider (components/layout)        ← giữ "ai đang đăng nhập" cho cả app (React Context)
   │ gọi login(...)
   ▼
lib/auth.ts  →  lib/api.ts              ← cổng DUY NHẤT gọi backend
   │  NEXT_PUBLIC_USE_MOCK=true
   ▼
mock/handlers.ts + mock/db.ts           ← backend giả (dữ liệu trong localStorage)
```

Khi có backend thật, chỉ đổi `NEXT_PUBLIC_USE_MOCK=false`: **trang không phải sửa** vì chúng chỉ nói chuyện với `api.ts`.

---

## 2. Danh sách kiến thức cần học (theo mức ưu tiên)

### Bắt buộc phải nắm (thầy chắc chắn hỏi)

**A. Next.js App Router** — `src/app/`
- **Thư mục = URL.** `src/app/(auth)/login/page.tsx` → `/login`.
- **`page.tsx`** là trang; **`layout.tsx`** là khung bọc các trang bên trong. `app/layout.tsx` (root) bọc mọi thứ và bắt buộc có `<html>`, `<body>`.
- **Route group `(auth)`, `(app)`**: thư mục có ngoặc *không* vào URL, chỉ để gom trang dùng chung layout. `(app)/layout.tsx` bọc mọi trang sau đăng nhập bằng `AppShell`.
- **Route động** `[id]`: `accounts/[id]/permissions/page.tsx`. Từ Next 15, `params` là **Promise** nên phải `await params`.
- **Catch-all** `[...slug]`: bắt mọi đường dẫn chưa có trang (`/horses`, `/plans`...) để hiện trang "sắp có".
- **Vì sao `page.tsx` chỉ có một dòng `export { default } from ...`?** Quy ước của nhóm: `app/` chỉ định tuyến, trang thật nằm ở `features/*/pages`.

**B. Server Component và Client Component (`"use client"`)**
- Mặc định file trong `app/` chạy ở server. File nào dùng `useState`, `useEffect`, `onClick`... phải có `"use client"` ở dòng đầu.
- Server render HTML trước, trình duyệt "hydrate" (gắn sự kiện) sau. Vì vậy code đọc `localStorage`/`window` phải nằm trong `useEffect`, nếu không server và client render khác nhau → lỗi hydration.
- Xem: `lib/hooks.ts` (`useQueryParams`, `useToday` chỉ có giá trị sau khi mount).

**C. React Context — `components/layout/AuthProvider.tsx`**
- Vấn đề: nhiều component xa nhau (Sidebar, Topbar, mọi trang) cần biết "ai đang đăng nhập" mà không muốn truyền props qua từng tầng.
- Giải pháp: `AuthContext` + `AuthProvider` bọc cả app (trong `Providers.tsx`), lấy ra bằng hook `useAuth()` / `useCurrentUser()`.
- `AuthProvider` còn lo: khôi phục phiên khi mở trang (`fetchMe`), hết phiên sau 30 phút không thao tác (timer + sự kiện click/keydown), xử lý 401/403 chung.
- **Câu hỏi hay gặp:** *Vì sao dùng `useRef` cho `statusRef`?* → callback `markExpired` được đăng ký một lần, cần đọc trạng thái mới nhất mà không tạo lại callback.

**D. Phân quyền RBAC — `lib/permissions.ts`, `RoleGuard.tsx`, `Sidebar.tsx`**
- **Một nguồn sự thật:** `permissions.ts` định nghĩa 12 quyền, menu của từng vai trò, và hàm `screenAccess(role, permissions, pathname)`.
- 3 lớp cùng đọc từ đó: (1) **Sidebar** chỉ hiện mục được cấp quyền (`navFor`), (2) **RoleGuard** chặn route → hiện trang 403 ngay tại URL, (3) **nút bị chặn** dùng `blockedReason` (disable + giải thích, không ẩn).
- **Kiểm tra ở cả UI và API:** `mock/handlers.ts` có `requirePermission` — client bị sửa tay thì server (mock) vẫn từ chối bằng 403.
- Quyền "thuộc về" vai trò khác (ví dụ *Place a Training Lock* chỉ thuộc Veterinarian): công tắc **hiện nhưng khóa**, kèm tooltip lý do (`permissionLock`).
- **Câu hỏi hay gặp:** *Nếu người dùng gõ tay URL của trang không có quyền thì sao?* → `RoleGuard` gọi `screenAccess` → không allowed → render `Forbidden403Page`. *Còn gọi API trực tiếp?* → API trả 403 → `api.ts` chuyển tới `/forbidden`.

**E. Cổng gọi API — `lib/api.ts`**
- Một hàm `api(method, path, body)`. Mock bật → `import("@/mock/handlers")` (nạp động, chỉ khi cần). Tắt → `fetch` thật kèm `credentials: "include"` (cookie phiên).
- Lỗi được gói thành `ApiError(status, code, ...)`. **401 + `UNAUTHENTICATED`** → mở Session Expired; **403 + `FORBIDDEN`** → trang 403.
- `lib/messages.ts` đổi mã lỗi (`INVALID_CREDENTIALS`, `OTP_INVALID`...) thành câu tiếng Anh dễ hiểu.

**F. CSS Modules + design tokens**
- Mỗi component có `X.module.css`; Next đổi tên class thành duy nhất (`styles.primary` → `Button_primary__a1b2`) nên **không đụng class giữa các file**.
- Màu, cỡ chữ, bo góc... chỉ dùng biến trong `styles/tokens.css` (`var(--brand)`), **không** viết mã hex. Đổi giao diện = đổi token.
- Nhớ: **không Tailwind, không thư viện UI** (yêu cầu của dự án).

### Nên nắm (để trả lời sâu)

**G. Form kiểm soát (controlled inputs) và validate** — xem `LoginPage.tsx`, `SignUpPage.tsx`
- Mỗi ô có `value` + `onChange` gắn với `useState`. Submit: validate ở client (câu lỗi dưới từng ô), gọi API, xử lý lỗi từ server.
- Quy tắc thông báo: lỗi **từng ô** = chữ đỏ dưới ô; lỗi **cả yêu cầu** = một `Alert` phía trên (có icon để không chỉ dựa vào màu).

**H. Field + Context nối label/lỗi vào ô nhập** — `components/form/Field.tsx`
- `Field` tạo `id` bằng `useId()`, cung cấp qua Context; `Input`/`Select`/`OtpInput` bên trong tự lấy `id`, `aria-invalid`, `aria-describedby`. Nhờ đó trang không phải tự đặt `htmlFor`, và trình đọc màn hình đọc được lỗi. Đây là ví dụ hay về **Context ở quy mô nhỏ**.

**I. Trợ năng (accessibility)**
- Mọi `input` có `label`. Nút chỉ có icon (`IconButton`) bắt buộc có `label`.
- Focus rõ (`:focus-visible` trong `global.css`), dùng được bằng bàn phím.
- Nút bị chặn dùng `aria-disabled` thay vì `disabled` để **vẫn focus được và đọc được lý do** (`Button.tsx`).
- `Modal.tsx`: đưa focus vào hộp khi mở, giữ Tab quay vòng trong hộp (focus trap), Esc để đóng, trả focus về chỗ cũ khi đóng.

**J. OTP (mã xác minh qua email)** — `OtpInput.tsx`, `OtpVerifyForm.tsx`, `mock/handlers.ts`
- Quy tắc dự án: **mọi xác minh email dùng mã OTP, không dùng link.**
- Backend (mock) sinh mã, hiệu lực **10 phút**, gửi lại sau **60 giây**, sai tối đa **5 lần**.
- Quên mật khẩu **luôn trả thông báo trung tính** (không cho biết email có tồn tại) — kể cả bước nhập OTP.
- `OtpInput`: 6 ô, hỗ trợ dán cả chuỗi, Backspace lùi ô, phím ← →, tự điền của điện thoại (`autoComplete="one-time-code"`).
- `useCountdown` (trong `lib/hooks.ts`) đếm ngược thời hạn và thời gian chờ gửi lại.

**K. Mock backend** — `mock/handlers.ts`, `mock/db.ts`, `mock/accounts.ts`
- `handleMock(method, path, body)` khớp đường dẫn bằng regex, trả dữ liệu hoặc ném `ApiError` y như backend thật.
- Dữ liệu lưu trong `localStorage` để thay đổi còn nguyên khi chuyển trang. Mật khẩu **không bao giờ** gửi xuống giao diện (`toPublic`).
- Phủ đủ **5 vai trò và 8 trạng thái** (quy tắc dự án).

### Biết qua là đủ

- **TypeScript generics** trong `DataTable<T>` và `Tabs<T>` (bảng/tab dùng lại cho mọi loại dữ liệu).
- **`dangerouslySetInnerHTML`** trong `Icon.tsx`: an toàn vì chuỗi SVG là hằng số do nhóm viết, không chứa dữ liệu người dùng.
- **`next/image`** cho ảnh nền và logo (`AuthLayout.tsx`).
- **Skeleton loading** trong `DataTable` (trạng thái đang tải), **Toast** (`ui/Toast.tsx`, Context + tự tắt sau ~4 giây).

---

## 3. Bản đồ file: muốn xem/sửa X thì mở file nào

| Muốn... | Mở |
|---|---|
| Đổi màu, cỡ chữ, bo góc | `src/styles/tokens.css` |
| Đổi vai trò nào thấy menu nào / được quyền gì | `src/lib/permissions.ts` |
| Đổi câu báo lỗi | `src/lib/messages.ts` |
| Đổi nhãn/màu của một trạng thái tài khoản | `src/lib/status.ts` |
| Đổi hạn OTP, số lần sai, thời gian chờ gửi lại | hằng số đầu `src/mock/handlers.ts` (backend thật sẽ do server quyết định) |
| Đổi thời gian hết phiên (30 phút) | `IDLE_MS` trong `src/components/layout/AuthProvider.tsx` |
| Thêm tài khoản mẫu | `src/mock/accounts.ts` |
| Trang đăng nhập / đăng ký / OTP | `src/features/auth/pages/` |
| Danh sách tài khoản, quyền từng người | `src/features/accounts/pages/` |
| Khung Sidebar / Topbar | `src/components/layout/` |
| Nút, bảng, hộp thoại, toast... | `src/components/ui/` |
| Ô nhập, chọn, checkbox, OTP | `src/components/form/` |
| Thêm một trang mới | tạo trang trong `features/<nghiệp vụ>/pages/`, rồi tạo thư mục + `page.tsx` (một dòng re-export) trong `src/app/` |

---

## 4. Câu hỏi vấn đáp mẫu (tự trả lời trước khi xem gợi ý)

1. **Vì sao chọn Next.js thay vì chỉ React?** — Routing theo thư mục, layout lồng nhau, render phía server (SEO/tải nhanh), tối ưu ảnh/font. Yêu cầu của môn học.
2. **`"use client"` để làm gì?** — Đánh dấu component chạy ở trình duyệt (có state, sự kiện). Không có thì mặc định chạy ở server và không dùng được `useState`.
3. **Phiên đăng nhập được giữ thế nào?** — Với backend thật: cookie phiên do server set, FE gửi kèm (`credentials: "include"`). Ở mock: lưu `accountId` trong localStorage (nhớ đăng nhập) hoặc sessionStorage (không nhớ). `AuthProvider` hỏi `/auth/me` mỗi lần mở trang.
4. **Làm sao chặn người không đủ quyền?** — 3 lớp cùng đọc `permissions.ts`: Sidebar ẩn mục, `RoleGuard` chặn route, API kiểm lại và trả 403. Nút bị chặn không ẩn mà disable + giải thích.
5. **Quên mật khẩu bảo mật thế nào?** — Luôn trả thông báo trung tính; OTP có hạn, giới hạn số lần sai và thời gian gửi lại; mật khẩu mới phải đủ mạnh (`passwordError`).
6. **Vì sao chỉ Horse Owner tự đăng ký được?** — Nhân viên do Club Manager tạo/mời. Form Sign Up vẫn hiện các vai trò khác nhưng khóa kèm lời giải thích.
7. **Hết phiên xử lý ra sao?** — 30 phút không thao tác, hoặc API trả 401, hoặc Club Manager khóa tài khoản → hộp thoại *Session Expired* (không có nút đóng): đăng nhập lại để ở nguyên màn hình, hoặc rời đi.
8. **Điều gì xảy ra khi thu hồi một quyền?** — Hộp xác nhận nêu hậu quả bằng số → sửa nháp → bấm Save → server ghi nhận + Audit Log → mục menu biến mất ở lần tải trang kế tiếp của tài khoản đó, URL trả 403.
9. **Khi backend thật xong cần sửa gì?** — Đổi `NEXT_PUBLIC_USE_MOCK=false`, đảm bảo backend trả đúng hình dạng dữ liệu và mã lỗi như `mock/handlers.ts`. Trang và component không phải sửa.
10. **Vì sao không dùng Tailwind/Material UI?** — Yêu cầu dự án: dùng design system riêng của EquiFlow qua CSS Modules và token.

---

## 5. Bài tập để tự tay làm (tăng độ hiểu)

1. **Dễ:** đổi thời gian hiệu lực OTP từ 10 phút sang 5 phút (`OTP_TTL`), thử lại luồng quên mật khẩu, thấy đồng hồ đếm ngược thay đổi.
2. **Dễ:** thêm một tài khoản mẫu vai trò Groom trạng thái ACTIVE trong `mock/accounts.ts` (xóa key `equiflow.mock.db.v1` để dữ liệu mới có hiệu lực).
3. **Vừa:** thêm mục "Notifications" vào sidebar Club Manager (`ROLE_NAV.CLUB_MANAGER` trong `permissions.ts`). Bấm vào → thấy trang "sắp có". Hiểu vì sao không cần tạo route.
4. **Vừa:** tạo route thật `/stalls` (thay trang "sắp có") theo đúng quy ước: viết `features/master-data/pages/StallMapPage.tsx`, tạo `src/app/(app)/stalls/page.tsx` một dòng re-export.
5. **Khó:** thêm quyền thứ 13 (ví dụ `exportReports`): thêm khóa vào `types/auth.ts`, một mục trong `PERMISSIONS` và `DEFAULT_ON`. Xem nó tự xuất hiện trong màn Permissions.

---

## 6. Chỗ khác với design và lý do (nên nhớ để giải thích)

| Design gốc | Bản đã làm | Lý do |
|---|---|---|
| Quên mật khẩu bằng **link** trong email | Bằng **mã OTP** 3 bước: email → OTP → mật khẩu mới | Quyết định của chủ dự án |
| Sign Up không xác minh email | Thêm bước **nhập OTP** rồi mới tới "chờ duyệt" | Cùng quyết định về OTP |
| Sign Up cho chọn 4 vai trò | Vẫn hiện 4 vai trò nhưng chỉ chọn được **Horse Owner** | Quy tắc dự án: nhân viên do Club Manager mời |
| Nút "Filter by role", "Create account" chỉ là hình | Có chức năng: lọc theo vai trò; tạo tài khoản nhân viên (trạng thái INVITED) | Cần cho demo |
| 7 tài khoản mẫu | 12 tài khoản | Quy tắc dự án: mỗi vai trò **và mỗi trạng thái** đều có tài khoản mẫu |
| Tiêu đề 1.4 là "Set a new password." (trùng 1.6) | "Reset your password." | Lỗi chép trong design |

---

## 7. Những gì CHƯA làm (đừng nói là đã có)

- Dashboard thật của từng vai trò (thuộc Priority 5) — hiện chỉ có trang chào.
- Ô tìm kiếm và chuông thông báo ở Topbar chỉ là giao diện (số thông báo là dữ liệu mẫu, riêng Club Manager đếm số yêu cầu chờ duyệt thật).
- Màn hình của Priority 2–7 (ngựa, huấn luyện, y tế...): menu đã trỏ tới trang "sắp có".
- Trang **AcceptInvite** (người được mời đặt mật khẩu) chưa có; hiện chỉ có tài khoản trạng thái INVITED và thông báo khi đăng nhập.
- Gửi email thật: mã OTP chỉ là mã cố định `123456` của mock.
- Chưa có kiểm thử tự động; đã kiểm bằng `npm run build` và chạy thử tay các luồng chính.
