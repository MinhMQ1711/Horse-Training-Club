import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/tokens.css";
import "@/styles/fonts.css";
import "@/styles/global.css";

// Next.js đọc `metadata` để tự tạo thẻ <title>, <meta>, favicon trong <head>.
export const metadata: Metadata = {
  title: "EquiFlow",
  description: "Horse club management workspace",
  icons: { icon: "/images/logo-fivegates.svg" },
};

// Root layout: bọc MỌI trang. Chỉ được có một file này ở cấp gốc và bắt buộc có <html> + <body>.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
