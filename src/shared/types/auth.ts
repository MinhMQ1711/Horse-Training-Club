// Kiểu dữ liệu dùng chung cho tài khoản, vai trò và quyền (khớp bảng users/roles/permissions ở backend).

export type Role = "HEAD_TRAINER" | "VETERINARIAN" | "GROOM" | "HORSE_OWNER" | "CLUB_MANAGER";

export const ROLES: Role[] = ["HEAD_TRAINER", "VETERINARIAN", "GROOM", "HORSE_OWNER", "CLUB_MANAGER"];

// Trạng thái tài khoản. PENDING_APPROVAL là trạng thái "Pending Approval" trong design
// (chờ Club Manager duyệt), các trạng thái còn lại theo CLAUDE.md.
export type AccountStatus =
  | "PENDING_EMAIL"
  | "PENDING_APPROVAL"
  | "PENDING_INTAKE"
  | "INVITED"
  | "ACTIVE"
  | "INACTIVE"
  | "REJECTED"
  | "LOCKED";

export type PermissionKey =
  | "viewHorses"
  | "editHorses"
  | "deleteHorses"
  | "createPlan"
  | "assignSchedule"
  | "recordMetrics"
  | "ackAlerts"
  | "viewMedical"
  | "placeLock"
  | "liftLock"
  | "manageAccounts"
  | "viewAudit";

export type PermissionMap = Record<PermissionKey, boolean>;

export type NotifyKey = "thresholdAlert" | "lockLifted" | "dailyDigest" | "raceResults";
export type NotifyMap = Record<NotifyKey, boolean>;

// Bản ghi đầy đủ (chỉ mock/backend mới có `password`).
export interface Account {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  status: AccountStatus;
  password: string;
  createdAt: string; // ISO
  lastActive: string | null; // ISO
  requestedAt: string | null; // ISO — lúc gửi yêu cầu đăng ký
  requestCode: string | null; // REQ-2609-014
  lockedAt: string | null; // ISO
  permissions: PermissionMap;
  permissionsChangedAt: string | null;
  permissionsChangedBy: string | null;
  notify: NotifyMap;
}

// Bản gửi xuống trình duyệt: không bao giờ có mật khẩu.
export type PublicAccount = Omit<Account, "password">;

// Người đang đăng nhập.
export type AuthUser = PublicAccount;
