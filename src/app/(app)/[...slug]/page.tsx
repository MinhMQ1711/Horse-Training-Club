import ComingSoonPage from "@/features/dashboard/pages/ComingSoonPage";

// Bắt mọi đường dẫn chưa có trang riêng (ngựa, huấn luyện, y tế...). RoleGuard đã kiểm quyền trước khi tới đây.
export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <ComingSoonPage slug={slug[0] ?? ""} />;
}
