import { DestinationManager } from "@/components/admin/destination-manager";
import {
  getAllDestinationsForAdmin,
  getDestinationCategories,
  getManagerOptions,
} from "@/server/queries/destinations";
import { requirePageRole } from "@/server/auth/dal";
import { DESTINATION_ROLES } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export default async function AdminDestinasiPage() {
  const user = await requirePageRole(DESTINATION_ROLES);
  const isManager = user.role === "DESTINATION_MANAGER";
  const [items, categories, managers] = await Promise.all([
    getAllDestinationsForAdmin(isManager ? user.id : undefined),
    getDestinationCategories(),
    user.role === "SUPER_ADMIN" ? getManagerOptions() : Promise.resolve([]),
  ]);
  return <DestinationManager items={items} categories={categories} managers={managers} role={user.role} />;
}
