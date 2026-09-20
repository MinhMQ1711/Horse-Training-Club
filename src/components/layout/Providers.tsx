"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "./AuthProvider";

// Gom mọi "provider" toàn cục ở một chỗ. layout.tsx (server) chỉ cần bọc <Providers>.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
