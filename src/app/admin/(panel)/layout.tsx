import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSiteSettings } from "@/server/queries/settings";
import { getSession } from "@/server/auth/dal";
import { countPendingSubmissions } from "@/server/queries/submissions";
import { CONTENT_ROLES } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

// Panel admin tidak boleh diindeks mesin pencari.
export const metadata: Metadata = {
  title: "Panel Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/admin/login");

  const badges: Record<string, number> = CONTENT_ROLES.includes(user.role)
    ? { "/admin/layanan": await countPendingSubmissions() }
    : {};

  const settings = await getSiteSettings();

  return (
    <AdminShell user={user} badges={badges} siteName={settings.siteName || "Purbalingga Memikat"} logoUrl={settings.logoUrl || undefined}>
      {children}
    </AdminShell>
  );
}
