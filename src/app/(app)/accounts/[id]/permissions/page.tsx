import PermissionMatrix from "@/features/accounts/pages/PermissionMatrix";

// Từ Next.js 15, `params` là một Promise nên phải await.
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PermissionMatrix accountId={id} />;
}
