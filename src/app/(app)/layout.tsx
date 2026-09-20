import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

// Mọi route trong nhóm (app) — tức mọi trang SAU đăng nhập — đều nằm trong khung AppShell.
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
