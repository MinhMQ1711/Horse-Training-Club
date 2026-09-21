# Hướng dẫn chi tiết từng thư mục và file

> Tổng quan dự án xem [README](../README.md). Sơ đồ hệ thống xem [ARCHITECTURE.md](ARCHITECTURE.md). Hợp đồng API xem [API_CONTRACT.md](API_CONTRACT.md).

Đồ án **SWP391**. Repo GitHub: `Horse-Training-Club` (thư mục dự án: `equiflow-web`).

Đây là phần **giao diện web (Frontend)**. Backend là REST API theo mô hình MVC, do nhóm khác làm riêng. Trong lúc backend chưa xong, FE chạy bằng **dữ liệu giả (mock)**.

> **Trạng thái hiện tại:** đã làm xong **Phase 0 (đăng nhập) và Priority 1** — đăng ký, xác minh email bằng OTP, quên mật khẩu, khung app (Sidebar/Topbar), phân quyền RBAC, danh sách tài khoản, quyền từng tài khoản, 403, hết phiên, hồ sơ và đổi mật khẩu (16 route). Các feature còn lại (`horses`, `training`, `health`...) chưa được tạo; mỗi phase sẽ tạo thư mục của nó khi bắt đầu. **Đọc [HUONG_DAN_HOC.md](HUONG_DAN_HOC.md)** để hiểu code, có tài khoản demo, mã OTP demo và câu hỏi vấn đáp mẫu.

---

## Mục lục

1. [Chạy dự án](#1-chạy-dự-án)
2. [Tech stack và quy ước chung](#2-tech-stack-và-quy-ước-chung)
3. [Sơ đồ tổng thể](#3-sơ-đồ-tổng-thể)
4. [File ở thư mục gốc](#4-file-ở-thư-mục-gốc)
5. [`public/` — file tĩnh](#5-public--file-tĩnh)
6. [`src/` — mã nguồn](#6-src--mã-nguồn)
   - [6.1 Các file lõi](#61-các-file-lõi)
   - [6.2 `app/`](#62-srcapp--routing-của-nextjs)
   - [6.3 `shared/components/`](#63-srcsharedcomponents--thành-phần-dùng-chung)
   - [6.4 `shared/lib/`](#64-srcsharedlib--logic-dùng-chung)
   - [6.5 `shared/mock/`](#65-srcsharedmock--dữ-liệu-giả)
   - [6.6 `shared/types/`](#66-srcsharedtypes--kiểu-dữ-liệu-dùng-chung)
   - [6.7 `shared/styles/`](#67-srcsharedstyles--giao-diện-toàn-cục)
   - [6.8 `features/`](#68-srcfeatures--các-nghiệp-vụ)
7. [Vai trò, trạng thái tài khoản và phân quyền](#7-vai-trò-trạng-thái-tài-khoản-và-phân-quyền)
8. [Luồng dữ liệu: từ trang đến API/mock](#8-luồng-dữ-liệu-từ-trang-đến-apimock)
9. [Quy tắc bắt buộc khi code](#9-quy-tắc-bắt-buộc-khi-code)
10. [Phân công và cách làm việc](#10-phân-công-và-cách-làm-việc)
11. [Quy ước Git](#11-quy-ước-git)
12. [Câu hỏi thường gặp: "Tôi cần làm X thì sửa ở đâu?"](#12-câu-hỏi-thường-gặp-tôi-cần-làm-x-thì-sửa-ở-đâu)

---

## 1. Chạy dự án

Yêu cầu: **Node.js ≥ 20.9** (đang dùng v24) và npm. Dự án dùng **Next.js 16**.

```bash
git clone https://github.com/MinhMQ1711/Horse-Training-Club.git
cd Horse-Training-Club
npm install
cp .env.example .env.local
npm run dev
```

Trên Windows PowerShell, thay `cp` bằng `Copy-Item .env.example .env.local`.

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy server phát triển của Next.js tại http://localhost:3000, tự tải lại khi sửa code |
| `npm run build` | Kiểm tra kiểu TypeScript và đóng gói ra thư mục `.next/`. **Phải chạy không lỗi trước khi báo xong việc** |
| `npm run start` | Chạy bản đã build (phải `npm run build` trước) |
| `npm run lint` | Kiểm tra lỗi code bằng Oxlint |

### Biến môi trường

Khai báo trong `.env.local` (file này **không** được đưa lên Git). File mẫu là `.env.example`.

| Biến | Giá trị mặc định | Ý nghĩa |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api` | Địa chỉ backend thật |
| `NEXT_PUBLIC_USE_MOCK` | `true` | `true` = dùng dữ liệu giả trong `src/shared/mock/`, không gọi backend. Đổi thành `false` khi backend đã sẵn sàng |

Tiền tố `NEXT_PUBLIC_` là **bắt buộc** để Next.js cho phép code chạy trên trình duyệt đọc biến đó. Biến không có tiền tố chỉ đọc được ở phía server.

> Đổi `.env.local` xong phải **dừng và chạy lại** `npm run dev` thì mới có hiệu lực.

---

## 2. Tech stack và quy ước chung

- **React 19 + TypeScript + Next.js 16 (App Router)**. Dùng Next.js theo yêu cầu của giảng viên.
- **Routing:** theo thư mục trong `src/app/` (không dùng `react-router-dom`). Xem [mục 6.2](#62-srcapp--routing-của-nextjs).
- **`"use client"`:** file component có state hoặc sự kiện (`useState`, `onClick`...) phải có dòng `"use client"` ở đầu file.
- **Alias import:** `@/` trỏ tới `src/` (ví dụ `import { Button } from "@/shared/components/ui/Button"`).
- **Style:** CSS thuần + **CSS Modules** (file `*.module.css`). **Không** dùng Tailwind, **không** dùng thư viện UI ngoài.
- **Không thêm thư viện mới** nếu chưa hỏi ý kiến cả nhóm.
- **Xác thực:** session cookie (backend set cookie, FE chỉ gửi kèm khi gọi API).
- **Ngôn ngữ:**
  - Toàn bộ chữ hiển thị trên giao diện: **tiếng Anh**.
  - Comment trong code và commit message: tiếng Việt hoặc tiếng Anh đều được.
- **Nguồn thiết kế**, theo thứ tự ưu tiên:
  1. Gói handoff từ **Claude Design** (dự án EquiFlow): bản **chuẩn** về giao diện.
  2. **EquiFlow Design System**: nguồn của `src/shared/styles/tokens.css`.
  3. Prototype cũ `D:\Tailieu_AI\NewHorse\NewHorse`: **chỉ đọc** để tham khảo nội dung, không sửa.

---

## 3. Sơ đồ tổng thể

```
equiflow-web/
├── .env.example            Mẫu biến môi trường (được commit)
├── .env.local              Biến môi trường thật của từng máy (KHÔNG commit)
├── .gitignore              Danh sách file Git bỏ qua
├── .oxlintrc.json          Cấu hình lint
├── CLAUDE.md               Quy tắc dự án cho Claude Code
├── README.md               Trang giới thiệu dự án
├── CONTRIBUTING.md         Cách đóng góp: nhánh, commit, Pull Request
├── docs/                   Tài liệu: kiến trúc, API, hướng dẫn
├── .github/                Mẫu Pull Request/Issue và CI (lint + build)
├── package.json            Khai báo thư viện và lệnh npm
├── package-lock.json       Khóa phiên bản thư viện
├── tsconfig.json           Cấu hình TypeScript (gồm alias @/ → src/)
├── next-env.d.ts           (tự sinh, không commit) Khai báo kiểu cho Next.js
├── .next/                  (tự sinh, không commit) Kết quả build
│
├── public/                 File tĩnh, phục vụ nguyên xi
│   ├── fonts/              Font chữ của hệ thống
│   └── images/             Logo Five Gates + ảnh editorial của trang đăng nhập
│
└── src/                    TOÀN BỘ mã nguồn nằm ở đây
    ├── app/                Routing của Next.js: layout.tsx, page.tsx, mỗi route một thư mục
    ├── shared/             DÙNG CHUNG cho mọi feature (viết trước)
    │   ├── components/
    │   │   ├── layout/     Khung trang: AppShell, Sidebar, Topbar, RoleGuard
    │   │   ├── ui/         Nút, bảng, modal, badge...
    │   │   └── form/       Ô nhập liệu, chọn ngày, upload...
    │   ├── lib/            Logic dùng chung: api, auth, permissions, status, messages
    │   ├── mock/           Dữ liệu giả + giả lập API
    │   ├── types/          Kiểu dữ liệu dùng chung (khớp tên bảng DB)
    │   └── styles/         tokens.css, fonts.css, global.css
    └── features/           Các NGHIỆP VỤ (mỗi nghiệp vụ một thư mục)
        ├── auth/           P1  Đăng nhập, đăng ký, hồ sơ cá nhân
        ├── accounts/       P1  Quản lý tài khoản, mời nhân viên, ma trận quyền
        ├── horses/         P2  Hồ sơ ngựa
        ├── intake/         P2  Tiếp nhận ngựa vào CLB
        ├── master-data/    P2  Danh mục: nhân viên, vật tư, chuồng
        ├── training/       P3  Kế hoạch và buổi huấn luyện
        ├── health/         P4  Sức khỏe, điều trị, khóa huấn luyện
        ├── dashboard/      P5  Bảng điều khiển, báo cáo, nhật ký
        ├── stable/         P6  (tùy chọn) Nghiệp vụ chăm sóc chuồng (Groom)
        └── racing/         P7  (tùy chọn) Đăng ký thi đấu, kết quả
```

**Ký hiệu P1–P7** là các phase (giai đoạn) của đồ án. P1–P5 là bắt buộc, P6–P7 làm nếu còn thời gian.

**Quy tắc phụ thuộc:** `app` → `features` → `shared`. Feature **không import lẫn nhau**; thứ gì hai feature cùng cần thì đưa vào `shared/`.

**Thư mục feature chỉ được tạo khi bắt đầu phase của nó.** Hiện có `auth`, `accounts`, `dashboard`. Không tạo sẵn thư mục rỗng, file rỗng hay `.gitkeep`, vì Git không lưu thư mục rỗng và chúng chỉ làm rối repo. Các feature trong sơ đồ trên là kế hoạch.

---

## 4. File ở thư mục gốc

| File | Chức năng | Có cần sửa không |
|---|---|---|
| `package.json` | Tên dự án, danh sách thư viện (`dependencies`) và các lệnh `npm run ...` | Chỉ khi thêm thư viện, mà việc này phải hỏi nhóm trước |
| `package-lock.json` | Ghi chính xác phiên bản từng thư viện để mọi máy cài giống nhau | Không sửa tay, npm tự cập nhật |
| `tsconfig.json` | Luật TypeScript cho cả dự án (chế độ `strict`, JSX) và **alias `@/*` → `src/*`**. Next.js có thể tự chỉnh nhẹ file này khi build | Không |
| `next-env.d.ts` | Next.js tự sinh để TypeScript hiểu kiểu của Next. **Không sửa, không commit** | Không |
| `.oxlintrc.json` | Cấu hình Oxlint (bắt lỗi dùng sai React hooks, cảnh báo export component) | Hiếm |
| `.gitignore` | Những gì Git **không** theo dõi: `node_modules`, `.next`, `next-env.d.ts`, `*.local` (gồm `.env.local`), file của editor | Hiếm |
| `.env.example` | **Mẫu** biến môi trường, được commit để người mới biết cần khai báo gì | Khi thêm biến mới |
| `.env.local` | Biến môi trường **thật** của máy bạn. **Không commit**. Tạo bằng cách copy từ `.env.example` | Tùy máy |
| `CLAUDE.md` | Quy tắc dự án cho Claude Code (công cụ AI): cấu trúc, quy tắc, cách làm việc. Người trong nhóm cũng nên đọc | Khi nhóm đổi quy ước |
| `README.md` | Tài liệu bạn đang đọc | Khi cấu trúc thay đổi |
| `HUONG_DAN_HOC.md` | Hướng dẫn học: tài khoản demo, giải thích code, kiến thức cần học, câu hỏi vấn đáp | Khi thêm tính năng lớn |

---

## 5. `public/` — file tĩnh

Mọi thứ trong `public/` được phục vụ **nguyên xi** ở đường dẫn gốc (ví dụ `public/fonts/x.woff2` truy cập bằng `/fonts/x.woff2`). Next.js không xử lý hay đổi tên chúng.

| Đường dẫn | Chức năng |
|---|---|
| `public/images/logo-fivegates.svg` | Logo **Five Gates** của EquiFlow. Cũng là biểu tượng trên tab trình duyệt (khai báo trong `src/app/layout.tsx`) |
| `public/images/equine-editorial.webp` | Ảnh ngựa ở cột phải trang đăng nhập/đăng ký (lấy từ gói thiết kế) |
| `public/fonts/` | **Font chữ** của hệ thống, copy từ prototype cũ |
| `public/fonts/equi-font-0.woff2` … `equi-font-7.woff2` | 8 file font dạng woff2 (định dạng nén cho web). File `src/shared/styles/fonts.css` sẽ khai báo `@font-face` trỏ tới các file này |
| `public/fonts/DM-Sans-OFL.txt`, `Manrope-OFL.txt` | Giấy phép **SIL OFL** của hai họ font DM Sans và Manrope. **Giữ lại**, vì giấy phép yêu cầu kèm theo khi phân phối font |

---

## 6. `src/` — mã nguồn

### 6.1 Các file lõi

| File | Chức năng |
|---|---|
| `src/app/layout.tsx` | **Root layout**: khung `<html>`/`<body>` bọc **mọi trang**. Nạp 3 file CSS toàn cục (`tokens.css`, `fonts.css`, `global.css`) và khai báo `metadata` (tiêu đề tab, favicon) |
| `src/app/page.tsx` | Trang của đường dẫn `/`. Hiện là trang tạm, sẽ chuyển hướng sang `/login` |

Next.js không có file "điểm khởi động" kiểu `main.tsx`; nó tự dựng ứng dụng từ thư mục `src/app/`.

### 6.2 `src/app/` — routing của Next.js

**Thư mục = đường dẫn URL.** Trong Next.js (App Router), một thư mục chứa file `page.tsx` sẽ trở thành một trang:

| File | URL |
|---|---|
| `src/app/page.tsx` | `/` |
| `src/app/(auth)/login/page.tsx` | `/login` |
| `src/app/(app)/accounts/page.tsx` | `/accounts` |
| `src/app/(app)/accounts/[id]/page.tsx` | `/accounts/nam` (`[id]` là tham số động) |

Vài điều cần biết:
- **Thư mục có ngoặc** như `(auth)`, `(app)` là **nhóm route**: chỉ để gom file và dùng chung `layout.tsx`, **không** xuất hiện trong URL.
- **`layout.tsx`** bọc các trang bên trong nó. Ví dụ `(app)/layout.tsx` sẽ chứa `AppShell` (Sidebar + Topbar) cho mọi trang sau đăng nhập.
- **`page.tsx` trong `app/` phải mỏng.** Trang thật nằm ở `features/<nghiệp vụ>/pages/`, còn `page.tsx` chỉ re-export:

```tsx
// src/app/(auth)/login/page.tsx
export { default } from "@/features/auth/pages/LoginPage";
```

- Route cần quyền được bọc bằng `RoleGuard` (xem [mục 7](#7-vai-trò-trạng-thái-tài-khoản-và-phân-quyền)).

> Quy tắc: muốn thêm trang mới thì tạo thư mục + `page.tsx` **trong `src/app/`**, và viết trang thật trong `features/`.

### 6.3 `src/shared/components/` — thành phần dùng chung

Các thành phần dùng ở **nhiều feature**. Viết trước, feature dùng lại. **Nếu đã có ở đây thì không được viết bản mới trong feature.** Người viết: FE1.

#### `shared/components/layout/` — khung trang

| Thành phần | Chức năng |
|---|---|
| `AppShell` | Khung tổng: Sidebar bên trái + Topbar phía trên + vùng nội dung. Mọi trang sau đăng nhập đều nằm trong khung này |
| `Sidebar` | Menu điều hướng bên trái. **Đọc danh sách mục menu từ `shared/lib/permissions.ts`** nên mỗi vai trò chỉ thấy mục của mình |
| `Topbar` | Thanh trên: thông tin người dùng, đăng xuất, thông báo |
| `RoleGuard` | Bọc route: nếu vai trò không đủ quyền thì chuyển tới `Forbidden403`; nếu chưa đăng nhập hoặc hết phiên thì tới `SessionExpired`/Login. Cũng đọc từ `shared/lib/permissions.ts` |

#### `shared/components/ui/` — thành phần giao diện

| Thành phần | Chức năng |
|---|---|
| `Button` | Nút bấm (các biến thể: chính, phụ, nguy hiểm...) |
| `StatusBadge` | Nhãn màu hiển thị trạng thái (ACTIVE, LOCKED...). Nhãn và màu lấy từ `shared/lib/status.ts` |
| `DataTable` | Bảng dữ liệu dùng chung, gồm sẵn trạng thái loading, rỗng, lỗi |
| `Modal` | Hộp thoại nổi |
| `ConfirmModal` | Hộp xác nhận ("Bạn có chắc muốn xóa?") cho thao tác nguy hiểm |
| `Toast` | Thông báo nhỏ hiện tạm thời (thành công/lỗi) |
| `EmptyState` | Hiển thị khi chưa có dữ liệu, có thể kèm nút hành động |
| `LockBanner` | Dải cảnh báo khi một đối tượng đang bị khóa (ví dụ ngựa bị **Training Lock**) |
| `DisabledHint` | **Nút bị chặn quyền:** nút bị disable **kèm tooltip giải thích lý do**. Dùng thay vì ẩn nút (xem [quy tắc 3](#9-quy-tắc-bắt-buộc-khi-code)) |

#### `shared/components/form/` — thành phần form

| Thành phần | Chức năng |
|---|---|
| `Field` | Ô nhập liệu có sẵn label, thông báo lỗi và liên kết trợ năng |
| `Select` | Ô chọn danh sách |
| `DatePicker` | Chọn ngày |
| `FileUpload` | Tải file lên (ảnh ngựa, giấy tờ...) |
| `PasswordStrength` | Thanh hiển thị độ mạnh mật khẩu (dùng ở Sign Up, Reset Password) |

### 6.4 `src/shared/lib/` — logic dùng chung

Các file **không có giao diện**, chỉ chứa logic. Gồm 5 file chính dưới đây, kèm các hàm phụ dùng chung: `session.ts`, `hooks.ts`, `format.ts`, `password.ts`, `navigation.ts`, `cx.ts`.

| File | Chức năng |
|---|---|
| `api.ts` | **Cổng duy nhất để gọi backend.** Bọc `fetch`: tự gắn cookie phiên, đọc `NEXT_PUBLIC_API_URL`; khi `NEXT_PUBLIC_USE_MOCK=true` thì chuyển sang `src/shared/mock/`. Xử lý lỗi chung: **401 → mở SessionExpired**, **403 → chuyển tới trang Forbidden403**. Trang và component **không được gọi `fetch` trực tiếp** |
| `auth.ts` | Trạng thái phiên đăng nhập: `currentUser` (ai đang đăng nhập, vai trò gì), hàm `login`/`logout`, kiểm tra còn phiên hay không |
| `permissions.ts` | **Bảng "vai trò → được làm gì".** Đây là **nguồn sự thật duy nhất** về phân quyền. `Sidebar` và `RoleGuard` đều đọc từ đây, nên muốn đổi quyền chỉ sửa một chỗ |
| `status.ts` | Chuyển **mã trạng thái** (enum như `PENDING_EMAIL`) thành **nhãn tiếng Anh** và **class màu badge**. Mọi `StatusBadge` đều dựa vào đây |
| `messages.ts` | Chuyển **mã lỗi từ API** thành **câu thông báo tiếng Anh dễ hiểu** cho người dùng |

### 6.5 `src/shared/mock/` — dữ liệu giả

Dữ liệu và handler giả lập API để **chạy giao diện khi chưa có backend**. Hiện có `db.ts` (kho dữ liệu trong `localStorage`), `handlers.ts` (các route giả) và `accounts.ts` (tài khoản mẫu). Được `shared/lib/api.ts` gọi khi `NEXT_PUBLIC_USE_MOCK=true`.

Yêu cầu bắt buộc cho mock:
- Có **ít nhất 1 tài khoản cho mỗi vai trò** (5 vai trò).
- Có **ít nhất 1 tài khoản cho mỗi trạng thái** (8 trạng thái).
- Mỗi trang mới phải có dữ liệu mock tương ứng.

### 6.6 `src/shared/types/` — kiểu dữ liệu dùng chung

Các `interface`/`type` TypeScript dùng ở **nhiều feature** (ví dụ `User`, `Role`, `AccountStatus`, `Horse`). **Đặt tên khớp với tên bảng trong database** để dễ đối chiếu với backend. Kiểu chỉ một feature dùng thì đặt trong `features/<tên>/types.ts`.

### 6.7 `src/shared/styles/` — giao diện toàn cục

| File | Chức năng |
|---|---|
| `tokens.css` | **Biến CSS thiết kế**: màu, cỡ chữ, khoảng cách, bo góc, bóng đổ. Lấy từ EquiFlow Design System. **Mọi giá trị giao diện phải dùng biến ở đây** (không hardcode màu hex) |
| `fonts.css` | Khai báo `@font-face` trỏ tới các file trong `public/fonts/` |
| `global.css` | Reset CSS, style nền cho `body`, `:focus-visible` (viền focus rõ cho trợ năng) |

### 6.8 `src/features/` — các nghiệp vụ

**Chia theo nghiệp vụ (flow), không chia theo vai trò.** Ví dụ, "Horse Detail" là một nghiệp vụ, mọi vai trò cùng vào đó, còn việc ai làm được gì do `permissions.ts` quyết định.

**Mỗi feature có cùng cấu trúc:**

```
features/<tên>/
├── pages/        Các TRANG (mỗi trang được một `page.tsx` trong `src/app/` re-export)
├── components/   Thành phần CHỈ dùng trong feature này
├── api.ts        Hàm gọi API của feature (dùng shared/lib/api.ts bên dưới)
└── types.ts      Kiểu dữ liệu CHỈ của feature này
```

- `pages/`: mỗi file là một màn hình hoàn chỉnh. Phải có đủ 4 trạng thái: **loading · empty · lỗi · bị chặn quyền**.
- `components/`: chỉ chứa thành phần riêng của feature. Nếu thấy dùng được ở feature khác thì chuyển lên `src/shared/components/`.
- `api.ts`: ví dụ `listHorses()`, `getHorse(id)`. Bên trong gọi `shared/lib/api.ts`, **không gọi `fetch` trực tiếp**.
- `types.ts`: kiểu chỉ feature này dùng (một số feature còn để trống vì chưa làm).

Danh sách trang dưới đây lấy từ `CLAUDE.md`. Mô tả là **chức năng dự kiến** dựa trên tên màn hình; khi làm thật hãy bám theo gói thiết kế Claude Design.

#### `auth/` — P1 · Xác thực và hồ sơ cá nhân · FE1

| Trang | Chức năng |
|---|---|
| `Landing` | Trang giới thiệu CLB, cổng vào cho khách |
| `Login` | Đăng nhập |
| `SignUp` | Đăng ký. **Chỉ dành cho Horse Owner** |
| `VerifyEmail` | Nhập **mã OTP** gửi về email để xác minh email sau khi đăng ký |
| `ForgotPassword` | Bước 1 quên mật khẩu: nhập email để nhận **mã OTP**. **Luôn trả thông báo trung tính** (không tiết lộ email có tồn tại hay không) |
| `ResetPassword` | Bước 2–3 quên mật khẩu: nhập **mã OTP** đã nhận, rồi đặt mật khẩu mới |
| `AcceptInvite` | Nhân viên nhận lời mời từ Club Manager: đặt mật khẩu, kích hoạt tài khoản (`INVITED` → `ACTIVE`) |
| `MyProfile` | Xem/sửa hồ sơ cá nhân, đổi mật khẩu |
| `Forbidden403` | Trang "không có quyền truy cập". Bị chuyển tới từ `RoleGuard` hoặc khi API trả 403 |
| `SessionExpired` | Thông báo hết phiên, dẫn về Login. Mở khi API trả 401 |

#### `accounts/` — P1 · Quản lý tài khoản · FE1

| Trang | Chức năng |
|---|---|
| `AccountList` | Danh sách tài khoản, lọc theo vai trò/trạng thái; khóa/mở khóa |
| `InviteStaff` | Club Manager mời nhân viên qua email và chọn vai trò |
| `PermissionMatrix` | Ma trận hiển thị vai trò nào có quyền gì |

#### `horses/` — P2 · Hồ sơ ngựa · FE1

| Trang | Chức năng |
|---|---|
| `HorseList` | Danh sách ngựa (Horse Owner chỉ thấy ngựa của mình) |
| `HorseDetail` | Hồ sơ chi tiết dạng **tabs** (thông tin, sức khỏe, huấn luyện...). **Tên ngựa ở mọi nơi đều là link mở trang này** |
| `HorseForm` | Form thêm/sửa ngựa |
| `PedigreeEditor` | Chỉnh sửa phả hệ (cha, mẹ, dòng dõi) |
| `AssignOwner` | Gắn chủ sở hữu cho ngựa |

#### `intake/` — P2 · Tiếp nhận ngựa · FE1

| Trang | Chức năng |
|---|---|
| `HorseIntake` | Tiếp nhận ngựa vào CLB. Gắn được ≥ 1 ngựa cho Owner thì Owner mới chuyển `PENDING_INTAKE` → `ACTIVE` |
| `BoardingRequests` | Danh sách yêu cầu gửi ngựa (boarding) chờ duyệt |
| `OwnerPendingHome` | Trang chủ của Owner **đang chờ** được tiếp nhận (chưa `ACTIVE`) |

#### `master-data/` — P2 · Danh mục · FE1

| Trang | Chức năng |
|---|---|
| `StaffDirectory` | Danh bạ nhân viên CLB |
| `SuppliesCatalog` | Danh mục vật tư (thức ăn, thuốc, dụng cụ...) |
| `StallMap` | Sơ đồ chuồng/ô ngựa |

#### `training/` — P3 · Huấn luyện · FE2

| Trang | Chức năng |
|---|---|
| `PlanList` | Danh sách kế hoạch huấn luyện |
| `PlanWizard` | Trình hướng dẫn từng bước để tạo kế hoạch |
| `TrainingCalendar` | Lịch huấn luyện |
| `TrialRuns` | Các lượt chạy thử |
| `SessionMetrics` | Chỉ số của từng buổi tập |
| `PlanHistory` | Lịch sử thay đổi kế hoạch |
| `LiveMonitor` | Theo dõi buổi tập theo thời gian thực |
| `AlertList` | Danh sách cảnh báo |

#### `health/` — P4 · Sức khỏe · FE2

| Trang | Chức năng |
|---|---|
| `HerdHealth` | Tổng quan sức khỏe cả đàn |
| `MedicalRecords` | Hồ sơ y tế từng con |
| `Treatments` | Các đợt điều trị |
| `InjuryMap` | Sơ đồ vị trí chấn thương |
| `TrainingLock` | Khóa/mở khóa huấn luyện cho ngựa (ví dụ đang chấn thương) |
| `CareSchedule` | Lịch chăm sóc (tiêm, khám, thú y) |

> **Training Lock có 2 phía, cả hai do FE2 làm:** phía **health** (thú y đặt khóa) và phía **training** (kế hoạch/lịch hiển thị `LockBanner` và không cho lên buổi tập khi ngựa bị khóa).

#### `dashboard/` — P5 · Bảng điều khiển và báo cáo · cả hai FE

| Trang | Chức năng |
|---|---|
| `TrainerDashboard` | Bảng điều khiển cho Head Trainer |
| `ManagerDashboard` | Bảng điều khiển cho Club Manager |
| `OwnerReport` | Báo cáo dành cho Horse Owner |
| `AuditLog` | Nhật ký thao tác trong hệ thống |

#### `stable/` — P6 · *(tùy chọn)* Chăm sóc chuồng · dành cho Groom

Quy trình hằng ngày (routine), khẩu phần ăn (rations), công việc (tasks), sự cố (incidents), vật tư (supplies).

#### `racing/` — P7 · *(tùy chọn)* Thi đấu

`RaceEntry` (đăng ký ngựa vào giải), `RaceResults` (kết quả).

---

## 7. Vai trò, trạng thái tài khoản và phân quyền

### 5 vai trò

| Mã | Ý nghĩa |
|---|---|
| `HEAD_TRAINER` | Huấn luyện viên trưởng |
| `VETERINARIAN` | Bác sĩ thú y |
| `GROOM` | Người chăm sóc ngựa hằng ngày |
| `HORSE_OWNER` | Chủ ngựa |
| `CLUB_MANAGER` | Quản lý CLB |

### 8 trạng thái tài khoản

| Mã | Ý nghĩa |
|---|---|
| `PENDING_EMAIL` | Owner đã đăng ký, chưa xác nhận email |
| `PENDING_APPROVAL` | Đã xác nhận email bằng OTP, chờ Club Manager duyệt |
| `PENDING_INTAKE` | Chờ được gắn ngựa qua Horse Intake (*dự kiến*, chưa có màn hình) |
| `INVITED` | Nhân viên được mời, chưa nhận lời mời |
| `ACTIVE` | Đang hoạt động |
| `INACTIVE` | Ngưng hoạt động |
| `REJECTED` | Bị từ chối |
| `LOCKED` | Bị khóa |

### Quy tắc nghiệp vụ

- **Sign Up chỉ dành cho Horse Owner.** Nhân viên được **Club Manager mời qua email**.
- Owner chỉ `ACTIVE` khi đã gắn **≥ 1 ngựa** (qua màn Horse Intake).
- **Forgot Password luôn trả thông báo trung tính.**
- **Xác minh email luôn bằng mã OTP gửi về email, không dùng link.** Quên mật khẩu = nhập email → nhập OTP → đặt mật khẩu mới.
- **Horse Owner chỉ thấy ngựa của mình.** Truy cập ngựa của người khác → `Forbidden403`.

### Cách phân quyền hoạt động (3 lớp, đều đọc từ `shared/lib/permissions.ts`)

1. **Menu:** `Sidebar` chỉ hiện mục mà vai trò được dùng.
2. **Route:** `RoleGuard` chặn người không đủ quyền vào trang.
3. **Nút hành động:** nút bị chặn dùng `DisabledHint` (**disable + tooltip lý do**, không ẩn), để người dùng hiểu vì sao không thao tác được.

---

## 8. Luồng dữ liệu: từ trang đến API/mock

```
Trang (features/*/pages)
   │  gọi
   ▼
features/*/api.ts        ví dụ: listHorses()
   │  gọi
   ▼
shared/lib/api.ts               gắn cookie, xử lý 401/403 chung
   │
   ├── NEXT_PUBLIC_USE_MOCK=true  ──►  src/shared/mock/    (dữ liệu giả)
   └── NEXT_PUBLIC_USE_MOCK=false ──►  Backend REST (NEXT_PUBLIC_API_URL)
```

Nhờ vậy khi backend xong, chỉ cần đổi `NEXT_PUBLIC_USE_MOCK=false`, **không phải sửa trang**.

Khi API trả lỗi, `shared/lib/messages.ts` đổi mã lỗi thành câu tiếng Anh dễ hiểu để hiển thị.

---

## 9. Quy tắc bắt buộc khi code

1. **Màu, cỡ chữ, bo góc, bóng đổ:** chỉ dùng biến trong `tokens.css`. **Không hardcode mã hex.**
2. **Thành phần đã có trong `shared/components/` thì dùng lại**, không viết bản mới trong feature.
3. **Quyền truy cập:** không kiểm tra vai trò rải rác trong trang. Dùng `permissions.ts` + `RoleGuard` (chặn route) + `DisabledHint` (nút bị chặn: disable + giải thích, **không ẩn**).
4. **Horse Owner chỉ thấy ngựa của mình**; truy cập ngựa khác → `Forbidden403`.
5. **Mỗi trang có đủ:** loading · empty state · lỗi · trạng thái bị chặn quyền.
6. **Tên ngựa luôn là link** mở `HorseDetail`.
7. **Trợ năng:** mọi input có label, `focus-visible` rõ ràng, dùng được bằng bàn phím.
8. **Mỗi trang mới phải có dữ liệu mock** tương ứng để chạy được khi chưa có API.
9. **Không thêm thư viện mới** nếu chưa hỏi ý kiến nhóm.
10. **Chữ trên giao diện: tiếng Anh.**

---

## 10. Phân công và cách làm việc

| Người | Phụ trách |
|---|---|
| **FE1** | `shared/components/` dùng chung, `auth`, `accounts`, `horses`, `intake`, `master-data` (P1–P2) |
| **FE2** | `training`, `health` (P3–P4). Cả 2 phía của Training Lock |
| **Cả hai** | `dashboard` (P5). P6–P7 nếu còn thời gian |

Cách làm việc:

1. **Trước khi code một phạm vi mới:** liệt kê màn hình + các file sẽ tạo/sửa, **chờ duyệt**.
2. **Làm xong mỗi màn:** dừng lại cho người dùng kiểm tra rồi mới làm tiếp.
3. **Chạy `npm run build` không lỗi** trước khi báo xong.

> Thứ tự gợi ý: viết `shared/styles/` (tokens, fonts, global) và `shared/components/` dùng chung **trước**, vì mọi feature đều phụ thuộc vào chúng.

---

## 11. Quy ước Git

- `main`: nhánh ổn định. Không làm việc trực tiếp trên đây.
- Mỗi người làm trên nhánh riêng theo phạm vi, ví dụ `fe1/auth`, `fe2/training`. Xong thì tạo Pull Request vào `main`.
- **Không commit:** `node_modules/`, `.next/`, `.env.local`. Các file này đã được `.gitignore` chặn, nhưng vẫn nên kiểm tra bằng `git status` trước khi commit.
- Commit message ngắn gọn, nói rõ đã làm gì (tiếng Việt hoặc tiếng Anh).

---

## 12. Câu hỏi thường gặp: "Tôi cần làm X thì sửa ở đâu?"

| Tôi muốn... | Sửa/tạo ở |
|---|---|
| Thêm một trang mới | Viết trang trong `features/<nghiệp vụ>/pages/`, rồi tạo thư mục + `page.tsx` tương ứng trong `src/app/` (chỉ re-export) |
| Thêm mục vào menu bên trái | `shared/lib/permissions.ts` (Sidebar sẽ tự đọc) |
| Đổi vai trò nào vào được trang nào | `shared/lib/permissions.ts` |
| Thêm nút/bảng/modal dùng ở nhiều nơi | `shared/components/ui/` |
| Thêm loại ô nhập liệu mới | `shared/components/form/` |
| Gọi một API mới | Thêm hàm vào `features/<nghiệp vụ>/api.ts` (dùng `shared/lib/api.ts`) |
| Thêm dữ liệu giả cho trang mới | `shared/mock/` |
| Đổi nhãn/màu của một trạng thái | `shared/lib/status.ts` |
| Đổi câu báo lỗi hiển thị | `shared/lib/messages.ts` |
| Thêm kiểu dữ liệu dùng chung | `shared/types/` (chỉ 1 feature dùng thì `features/<tên>/types.ts`) |
| Đổi màu chủ đạo, cỡ chữ, bo góc | `shared/styles/tokens.css` |
| Thêm font | Đặt file vào `public/fonts/`, khai báo trong `shared/styles/fonts.css` |
| Đổi địa chỉ backend hoặc bật/tắt mock | `.env.local` |
| Thêm biến môi trường mới | `.env.example` (kèm hướng dẫn) và `.env.local` |
| Thêm thư viện mới | **Hỏi nhóm trước**, rồi `npm install` |
