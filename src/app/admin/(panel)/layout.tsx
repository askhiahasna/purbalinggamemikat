import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
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

  return (
    <div className="flex min-h-screen bg-stone-100 text-stone-900 font-body">
      <AdminSidebar role={user.role} badges={badges} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar user={user} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
