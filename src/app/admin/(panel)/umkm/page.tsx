import { BusinessManager } from "@/components/admin/managers";
import { getBusinessesForAdmin, getCategoriesByType } from "@/server/queries/content";
import { requirePageRole } from "@/server/auth/dal";
import { CONTENT_ROLES } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export default async function AdminUmkmPage() {
  await requirePageRole(CONTENT_ROLES);
  const [rows, categories] = await Promise.all([getBusinessesForAdmin(), getCategoriesByType("UMKM")]);
  return <BusinessManager rows={rows} categories={categories} />;
}
