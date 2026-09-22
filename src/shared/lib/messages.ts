// Mã lỗi từ API → câu thông báo tiếng Anh dễ hiểu. Nêu điều kiện, không trách người dùng.

import { ApiError } from "@/shared/lib/api";
import { formatDateTime, formatTime } from "@/shared/lib/format";

export type AlertTone = "ok" | "warn" | "danger" | "info";

export interface AlertSpec {
  tone: AlertTone;
  icon: string;
  title: string;
  body: string;
}

const GENERIC: Record<string, string> = {
  NETWORK_ERROR: "The service did not answer. Check the connection and try again.",
  SERVICE_UNAVAILABLE: "The service did not answer. Nothing was changed. Try again in a moment.",
  EMAIL_TAKEN: "This email already has an account in the system.",
  ROLE_NOT_ALLOWED: "Only Horse Owner accounts can be requested here. Staff accounts are created by the Club Manager.",
  WEAK_PASSWORD: "Add an uppercase letter, a digit or a symbol.",
  CANNOT_LOCK_SELF: "You cannot lock your own account. Ask another Club Manager.",
  LAST_MANAGER: "The club must keep at least one active Club Manager.",
  RESET_EXPIRED: "This reset session has expired. Request a new code.",
  FORBIDDEN: "This action is not part of your permissions.",
};

export function messageFor(err: unknown): string {
  if (err instanceof ApiError) return GENERIC[err.code] ?? err.message ?? "Something went wrong. Try again.";
  return "Something went wrong. Try again.";
}

// Câu lỗi cho ô nhập mã OTP.
export function otpMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return messageFor(err);
  const left = Number(err.data.attemptsLeft ?? 0);
  switch (err.code) {
    case "OTP_INVALID":
      return left > 0
        ? `The code is not correct. ${left} ${left === 1 ? "attempt" : "attempts"} left.`
        : "The code is not correct.";
    case "OTP_EXPIRED":
      return "This code has expired. Request a new one.";
    case "OTP_ATTEMPTS_EXCEEDED":
      return "Too many wrong codes. Request a new code to continue.";
    case "OTP_NOT_FOUND":
      return "No code is waiting for this address. Request a new one.";
    default:
      return messageFor(err);
  }
}

export interface LoginFailure {
  alert: AlertSpec;
  passwordError?: string;
  // Nút đăng nhập bị khóa + tooltip giải thích ai xử lý được.
  blockedReason?: string;
  footNote?: string;
}

// Kết quả đăng nhập thất bại (design 0.4 – 0.6) → nội dung Alert, nút và chú thích.
export function loginFailure(err: unknown): LoginFailure {
  if (!(err instanceof ApiError)) {
    return { alert: { tone: "danger", icon: "xCircle", title: "Sign-in failed", body: messageFor(err) } };
  }
  const d = err.data;
  const who = d.fullName ? `${d.fullName} · ${d.roleLabel}` : undefined;

  switch (err.code) {
    case "INVALID_CREDENTIALS": {
      const left = Number(d.attemptsLeft ?? 0);
      return {
        alert: {
          tone: "danger",
          icon: "alert",
          title: "Email or password is incorrect",
          body: `${left} ${left === 1 ? "attempt" : "attempts"} left before the account is locked for 15 minutes.`,
        },
        passwordError: "Password is incorrect.",
        footNote: "Not sure of the password? Use Forgot password to set a new one",
      };
    }
    case "ATTEMPTS_EXCEEDED":
      return {
        alert: {
          tone: "danger",
          icon: "alert",
          title: "Too many attempts",
          body: `The account is locked for 15 minutes${d.retryAt ? ` (until ${formatTime(String(d.retryAt))})` : ""}. Contact support@equiflow.vn if you need access now.`,
        },
        passwordError: "Password is incorrect.",
      };
    case "ACCOUNT_LOCKED":
      return {
        alert: {
          tone: "danger",
          icon: "ban",
          title: "Account is locked",
          body: `The Club Manager locked this account at ${d.lockedAt ? formatDateTime(String(d.lockedAt)) : "an earlier time"}. Contact support@equiflow.vn to have it unlocked.`,
        },
        blockedReason: "Only the Club Manager can unlock an account.",
        footNote: who,
      };
    case "ACCOUNT_PENDING":
      return {
        alert: {
          tone: "warn",
          icon: "clock",
          title: "Account is pending approval",
          body: `The request reached the Club Manager at ${d.requestedAt ? formatDateTime(String(d.requestedAt)) : "an earlier time"}. An email follows as soon as it is approved.`,
        },
        blockedReason: "The account works only after the Club Manager approves it.",
        footNote: who ? `${who}${d.requestedAt ? ` · requested ${formatDateTime(String(d.requestedAt)).split(" · ")[0]}` : ""}` : undefined,
      };
    case "EMAIL_NOT_VERIFIED":
      return {
        alert: {
          tone: "warn",
          icon: "mail",
          title: "Email is not verified yet",
          body: "Enter the 6-digit code sent to this address to finish the sign-up request.",
        },
        blockedReason: "Verify the email with the code first.",
        footNote: who,
      };
    case "ACCOUNT_INVITED":
      return {
        alert: {
          tone: "info",
          icon: "mail",
          title: "Invitation not accepted yet",
          body: "Use the invitation email from the Club Manager to set a password before signing in.",
        },
        blockedReason: "The invitation must be accepted first.",
        footNote: who,
      };
    case "PENDING_INTAKE":
      return {
        alert: {
          tone: "warn",
          icon: "clock",
          title: "Waiting for horse intake",
          body: "The account becomes active once at least one horse is assigned to it at intake.",
        },
        blockedReason: "The Club Manager assigns a horse at intake first.",
        footNote: who,
      };
    case "ACCOUNT_INACTIVE":
      return {
        alert: {
          tone: "danger",
          icon: "ban",
          title: "Account is inactive",
          body: "This account was switched off. Contact support@equiflow.vn to reactivate it.",
        },
        blockedReason: "Only the Club Manager can reactivate an account.",
        footNote: who,
      };
    case "ACCOUNT_REJECTED":
      return {
        alert: {
          tone: "danger",
          icon: "xCircle",
          title: "The request was declined",
          body: "The Club Manager declined this account request. Send a new request if the details were wrong.",
        },
        blockedReason: "The request was declined by the Club Manager.",
        footNote: who,
      };
    default:
      return { alert: { tone: "danger", icon: "xCircle", title: "Sign-in failed", body: messageFor(err) } };
  }
}
