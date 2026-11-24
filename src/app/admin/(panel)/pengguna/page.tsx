import { UserManager } from "@/components/admin/user-manager";
import { getUsersForAdmin, getDestinationOptions } from "@/server/queries/users";
import { requirePageRole } from "@/server/auth/dal";
import { ADMIN_ONLY } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export default async function AdminPenggunaPage() {
  const me = await requirePageRole(ADMIN_ONLY);
  const [rows, destinations] = await Promise.all([getUsersForAdmin(), getDestinationOptions()]);
  return <UserManager rows={rows} destinations={destinations} currentUserId={me.id} />;
}
