# TMEC - Quản lý CLB đua ngựa (Frontend)

Đồ án SWP391. React + Vite + TypeScript. Đây là **khung trắng**: các file trong `src/` đều rỗng, chỉ để nhìn cấu trúc. Code được viết khi có yêu cầu.

Bản đã code xong Phase 0 + Priority 1 (đăng nhập, phân quyền) nằm ở tag `v0.1.0-priority1`.

```text
Horse-Training-Club/
├── public/                  ảnh, font, logo
├── docs/                    tài liệu hệ thống: ARCHITECTURE.md (sơ đồ), API_CONTRACT.md (API)
├── index.html               trang HTML duy nhất
├── package.json             danh sách thư viện và lệnh chạy
├── vite.config.ts           cấu hình Vite
├── tsconfig.json            cấu hình TypeScript
├── .env.example             mẫu biến môi trường
├── CLAUDE.md                quy tắc làm việc
└── src/
    ├── main.tsx             điểm khởi động
    ├── app/
    │   └── router.tsx       bảng đường dẫn: URL nào hiện trang nào
    ├── features/            MỖI NGHIỆP VỤ MỘT THƯ MỤC
    │   ├── auth/            đăng nhập, đăng ký, OTP, hồ sơ cá nhân        (P1)
    │   ├── accounts/        danh sách tài khoản, phân quyền               (P1)
    │   ├── horses/          hồ sơ ngựa                                    (P2)
    │   ├── master-data/     nhân viên, vật tư, chuồng                     (P2)
    │   ├── training/        giáo án, lịch tập, cảnh báo                   (P3)
    │   ├── health/          sức khỏe, khóa huấn luyện                     (P4)
    │   ├── dashboard/       trang tổng quan, báo cáo, nhật ký             (P5)
    │   ├── stable/          chuồng trại, khẩu phần (tùy chọn)             (P6)
    │   └── racing/          thi đấu (tùy chọn)                            (P7)
    │      (mỗi feature có: pages/ = màn hình, components/ = mảnh giao diện,
    │       api.ts = gọi dữ liệu, types.ts = kiểu dữ liệu)
    └── shared/              đồ dùng chung
        ├── components/      ui/ (nút, bảng, hộp thoại), form/ (ô nhập), layout/ (khung trang)
        ├── lib/             hàm dùng chung (gọi API, phân quyền, ...)
        ├── mock/            dữ liệu giả khi chưa có backend
        ├── styles/          màu, font, CSS chung
        └── types/           kiểu dữ liệu dùng chung
```
