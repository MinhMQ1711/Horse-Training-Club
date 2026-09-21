// Mã trạng thái (enum) → nhãn tiếng Anh + tông màu của Badge. Mọi Badge trạng thái đều đọc từ đây.
// Trạng thái tài khoản (PENDING, ACTIVE, LOCKED...) sẽ được thêm vào đây khi làm Priority 1.

import type { HealthStatus, TrainingLockScope, TrainingPlanStatus } from "@/shared/types/enums";

export type BadgeTone = "ok" | "warn" | "danger" | "info" | "neutral" | "violet" | "brand";

export const HEALTH_STATUS: Record<HealthStatus, { label: string; tone: BadgeTone; icon: string }> = {
  FIT: { label: "Fit", tone: "ok", icon: "checkCircle" },
  UNDER_OBSERVATION: { label: "Under Observation", tone: "warn", icon: "eye" },
  INJURED: { label: "Injured", tone: "danger", icon: "alert" },
  QUARANTINED: { label: "Quarantined", tone: "violet", icon: "shield" },
};

export const PLAN_STATUS: Record<TrainingPlanStatus, { label: string; tone: BadgeTone }> = {
  DRAFT: { label: "Draft", tone: "neutral" },
  ACTIVE: { label: "Active", tone: "ok" },
  PAUSED: { label: "Paused", tone: "warn" },
  COMPLETED: { label: "Completed", tone: "info" },
  SUSPENDED: { label: "Suspended", tone: "danger" },
};

export const LOCK_SCOPE: Record<TrainingLockScope, string> = {
  FULL: "Full lock",
  HIGH_INTENSITY_ONLY: "High-intensity only",
};
