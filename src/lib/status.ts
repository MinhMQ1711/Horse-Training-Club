// Mã trạng thái tài khoản → nhãn tiếng Anh + tông màu của Badge.

import type { AccountStatus } from "@/types/auth";

export type BadgeTone = "ok" | "warn" | "danger" | "info" | "neutral" | "violet" | "brand";

export const ACCOUNT_STATUS: Record<AccountStatus, { label: string; tone: BadgeTone }> = {
  PENDING_EMAIL: { label: "Email not verified", tone: "warn" },
  PENDING_APPROVAL: { label: "Pending Approval", tone: "warn" },
  PENDING_INTAKE: { label: "Pending Intake", tone: "warn" },
  INVITED: { label: "Invited", tone: "info" },
  ACTIVE: { label: "Active", tone: "ok" },
  INACTIVE: { label: "Inactive", tone: "neutral" },
  REJECTED: { label: "Rejected", tone: "danger" },
  LOCKED: { label: "Locked", tone: "danger" },
};

export type AccountTab = "ALL" | "PENDING" | "ACTIVE" | "LOCKED";

// Tab "Pending" gom mọi loại chờ xử lý.
export function tabOf(status: AccountStatus): AccountTab {
  if (status === "ACTIVE") return "ACTIVE";
  if (status === "LOCKED") return "LOCKED";
  if (status === "PENDING_EMAIL" || status === "PENDING_APPROVAL" || status === "PENDING_INTAKE" || status === "INVITED") {
    return "PENDING";
  }
  return "ALL";
}
