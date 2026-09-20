import type { Role } from "@/types/auth";

// Kiểu dữ liệu riêng của feature auth (khớp phản hồi của các route /auth/* ở backend).

export type OtpPurpose = "signup" | "reset";

// Mốc thời gian (mili-giây epoch) của mã OTP đang hiệu lực.
export interface OtpTimes {
  sentAt: number;
  expiresAt: number;
  resendAt: number; // sau mốc này mới được xin gửi lại
}

export interface RegisterInput {
  fullName: string;
  email: string;
  role: Exclude<Role, "CLUB_MANAGER">; // vai trò MUỐN xin; Club Manager duyệt và gán vai trò (SRS US-F1-01)
  password: string;
}

// Kết quả sau khi xác minh email: yêu cầu đã chuyển tới Club Manager.
export interface RegistrationResult {
  email: string;
  fullName: string;
  role: string;
  requestCode: string;
  requestedAt: string;
  reviewer: string;
}

export interface ResetVerifyResult {
  resetToken: string;
  expiresAt: number;
}

export interface ForbiddenInfo {
  reference: string;
  managerName: string;
}
