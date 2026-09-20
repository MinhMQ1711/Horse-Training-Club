// "Cơ sở dữ liệu" giả nằm trong localStorage của trình duyệt, để thay đổi (duyệt, khóa, đổi quyền...)
// còn nguyên khi chuyển trang hoặc tải lại. Xóa key này (hoặc gọi resetDb) để về dữ liệu ban đầu.
// Mỗi lần gọi getDb() đọc lại từ localStorage => hai tab thấy dữ liệu của nhau.

import { seedAccounts } from "@/mock/accounts";
import type { Account, PublicAccount } from "@/types/auth";

const KEY = "equiflow.mock.db.v2";

export type OtpPurpose = "signup" | "reset";

export interface OtpRecord {
  email: string;
  purpose: OtpPurpose;
  code: string;
  sentAt: number;
  expiresAt: number;
  resendAt: number;
  attempts: number;
}

export interface AuditEntry {
  at: string;
  actor: string;
  action: string;
  detail: string;
}

export interface PermissionRequest {
  at: string;
  from: string;
  screen: string;
  reference: string;
}

export interface Db {
  accounts: Account[];
  otps: OtpRecord[];
  loginFails: Record<string, { fails: number; lockedUntil: number }>;
  resetTokens: Record<string, { email: string; expiresAt: number }>;
  audit: AuditEntry[];
  requests: PermissionRequest[];
  seq: number; // số thứ tự cho mã yêu cầu REQ-YYMM-NNN
}

function fresh(): Db {
  return { accounts: seedAccounts(), otps: [], loginFails: {}, resetTokens: {}, audit: [], requests: [], seq: 14 };
}

export function getDb(): Db {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {
    // dữ liệu hỏng hoặc bị chặn: dùng dữ liệu mới
  }
  return fresh();
}

export function saveDb(db: Db): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    // bỏ qua: mock sẽ quay về dữ liệu ban đầu ở lần đọc sau
  }
}

export function resetDb(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // bỏ qua
  }
}

// Không bao giờ gửi mật khẩu xuống giao diện.
export function toPublic(account: Account): PublicAccount {
  const { password: _password, ...rest } = account;
  void _password;
  return rest;
}

export function audit(db: Db, actor: string, action: string, detail: string): void {
  db.audit.unshift({ at: new Date().toISOString(), actor, action, detail });
  db.audit = db.audit.slice(0, 200);
}
