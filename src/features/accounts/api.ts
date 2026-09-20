import { api } from "@/lib/api";
import type { PermissionMap, PublicAccount } from "@/types/auth";
import type { CreateAccountInput, SavePermissionsResult } from "./types";

export const listAccounts = () => api<{ accounts: PublicAccount[] }>("GET", "/accounts");

export const getAccount = (id: string) => api<{ account: PublicAccount }>("GET", `/accounts/${id}`);

// Tạo tài khoản nhân viên: trạng thái INVITED, người được mời nhận email để đặt mật khẩu.
export const createAccount = (input: CreateAccountInput) => api<{ account: PublicAccount }>("POST", "/accounts", input);

export type AccountAction = "approve" | "decline" | "lock" | "unlock";

export const runAccountAction = (id: string, action: AccountAction) =>
  api<{ account: PublicAccount }>("POST", `/accounts/${id}/${action}`);

export const savePermissions = (id: string, permissions: PermissionMap) =>
  api<SavePermissionsResult>("PUT", `/accounts/${id}/permissions`, { permissions });
