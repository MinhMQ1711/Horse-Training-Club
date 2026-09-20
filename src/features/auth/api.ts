import { api } from "@/lib/api";
import type { AuthUser, NotifyKey } from "@/types/auth";
import type { ForbiddenInfo, OtpPurpose, OtpTimes, RegisterInput, RegistrationResult, ResetVerifyResult } from "./types";

// ---- đăng ký + xác minh email (OTP) ----
export const register = (input: RegisterInput) => api<{ email: string } & OtpTimes>("POST", "/auth/register", input);

export const verifyEmail = (email: string, code: string) =>
  api<RegistrationResult>("POST", "/auth/verify-email", { email, code });

export const otpStatus = (email: string, purpose: OtpPurpose) =>
  api<OtpTimes>("GET", `/auth/otp?email=${encodeURIComponent(email)}&purpose=${purpose}`);

export const resendOtp = (email: string, purpose: OtpPurpose) =>
  api<OtpTimes>("POST", "/auth/otp/resend", { email, purpose });

// ---- quên mật khẩu: email → OTP → mật khẩu mới ----
export const forgotPassword = (email: string) =>
  api<{ sent: true } & OtpTimes>("POST", "/auth/forgot-password", { email });

export const verifyResetOtp = (email: string, code: string) =>
  api<ResetVerifyResult>("POST", "/auth/reset-password/verify", { email, code });

export const resetPassword = (resetToken: string, password: string) =>
  api<{ ok: true }>("POST", "/auth/reset-password", { resetToken, password });

// ---- hồ sơ cá nhân ----
export const updateProfile = (input: { fullName: string; phone: string }) =>
  api<{ user: AuthUser }>("PUT", "/me/profile", input);

export const updateNotification = (key: NotifyKey, value: boolean) =>
  api<{ user: AuthUser }>("PUT", "/me/notifications", { key, value });

export const changePassword = (current: string, next: string) =>
  api<{ nextChangeDue: string }>("POST", "/me/password", { current, next });

// ---- 403 ----
export const logForbidden = (screen: string) => api<ForbiddenInfo>("POST", "/audit/forbidden", { screen });

export const requestPermission = (screen: string, reference: string) =>
  api<{ ok: true }>("POST", "/permission-requests", { screen, reference });
