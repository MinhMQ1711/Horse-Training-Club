import type { PublicAccount } from "@/shared/types/auth";

export interface CreateAccountInput {
  fullName: string;
  email: string;
  role: PublicAccount["role"];
}

export interface SavePermissionsResult {
  account: PublicAccount;
  granted: number;
  revoked: number;
}
