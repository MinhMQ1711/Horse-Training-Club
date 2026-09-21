// Dữ liệu mẫu: 7 tài khoản của design (LO_TRINH.md) + 5 tài khoản bổ sung để mock có đủ
// mọi vai trò VÀ mọi trạng thái (quy tắc trong CLAUDE.md). Mật khẩu demo: equiflow123.

import { defaultNotify, defaultPermissions } from "@/shared/lib/permissions";
import type { Account } from "@/shared/types/auth";

type Seed = Pick<Account, "id" | "fullName" | "email" | "role" | "status"> & Partial<Account>;

function make(seed: Seed): Account {
  return {
    phone: "0900 000 000",
    password: "equiflow123",
    createdAt: "2025-06-01T09:00:00",
    lastActive: null,
    requestedAt: null,
    requestCode: null,
    lockedAt: null,
    permissions: defaultPermissions(seed.role),
    permissionsChangedAt: null,
    permissionsChangedBy: null,
    notify: defaultNotify(seed.role),
    ...seed,
  };
}

export function seedAccounts(): Account[] {
  return [
    make({
      id: "nam", fullName: "Trần Văn Nam", email: "nam.tran@equiflow.vn", role: "HEAD_TRAINER", status: "ACTIVE",
      phone: "0912 445 118", createdAt: "2025-02-04T09:00:00", lastActive: "2026-09-19T07:12:00",
      permissionsChangedAt: "2026-09-12T10:00:00", permissionsChangedBy: "Đỗ Quốc Việt",
    }),
    make({
      id: "chau", fullName: "Lê Minh Châu", email: "chau.le@equiflow.vn", role: "VETERINARIAN", status: "ACTIVE",
      phone: "0903 221 764", createdAt: "2025-03-10T09:00:00", lastActive: "2026-09-19T06:48:00",
    }),
    make({
      id: "binh", fullName: "Phạm Thị Bình", email: "binh.pham@equiflow.vn", role: "GROOM", status: "LOCKED",
      phone: "0977 310 552", lastActive: "2026-09-12T14:02:00", lockedAt: "2026-09-12T14:12:00",
    }),
    make({
      id: "anh", fullName: "Nguyễn Hoàng Anh", email: "anh.nguyen@equiflow.vn", role: "HORSE_OWNER", status: "PENDING_APPROVAL",
      phone: "0938 640 019", requestedAt: "2026-09-18T09:40:00", requestCode: "REQ-2609-012",
    }),
    make({
      id: "viet", fullName: "Đỗ Quốc Việt", email: "viet.do@equiflow.vn", role: "CLUB_MANAGER", status: "ACTIVE",
      phone: "0989 100 200", createdAt: "2024-11-15T09:00:00", lastActive: "2026-09-19T08:30:00",
    }),
    make({
      id: "ha", fullName: "Lý Thu Hà", email: "ha.ly@equiflow.vn", role: "HORSE_OWNER", status: "ACTIVE",
      phone: "0945 882 306", lastActive: "2026-09-17T21:15:00",
    }),
    make({
      id: "khoi", fullName: "Vũ Đình Khôi", email: "khoi.vu@equiflow.vn", role: "HORSE_OWNER", status: "ACTIVE",
      phone: "0918 777 043", lastActive: "2026-09-15T09:51:00",
    }),
    // ---- bổ sung để phủ đủ 8 trạng thái ----
    make({
      id: "ngoc", fullName: "Trịnh Bảo Ngọc", email: "ngoc.trinh@equiflow.vn", role: "HORSE_OWNER", status: "PENDING_EMAIL",
      requestedAt: "2026-09-19T08:05:00", requestCode: "REQ-2609-013",
    }),
    make({
      id: "huy", fullName: "Hoàng Gia Huy", email: "huy.hoang@equiflow.vn", role: "HORSE_OWNER", status: "PENDING_INTAKE",
      requestedAt: "2026-09-16T10:20:00", requestCode: "REQ-2609-011",
    }),
    make({ id: "tung", fullName: "Ngô Thanh Tùng", email: "tung.ngo@equiflow.vn", role: "GROOM", status: "INVITED" }),
    make({
      id: "khang", fullName: "Đặng Minh Khang", email: "khang.dang@equiflow.vn", role: "VETERINARIAN", status: "INACTIVE",
      lastActive: "2026-06-30T17:00:00",
    }),
    make({
      id: "trang", fullName: "Bùi Thu Trang", email: "trang.bui@equiflow.vn", role: "HORSE_OWNER", status: "REJECTED",
      requestedAt: "2026-09-10T14:30:00", requestCode: "REQ-2609-009",
    }),
  ];
}
