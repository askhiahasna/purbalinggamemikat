import { CulinaryManager } from "@/components/admin/managers";
import { getCulinaryForAdmin, getCategoriesByType } from "@/server/queries/content";
import { requirePageRole } from "@/server/auth/dal";
import { CONTENT_ROLES } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export default async function AdminKulinerPage() {
  await requirePageRole(CONTENT_ROLES);
  const [rows, categories] = await Promise.all([getCulinaryForAdmin(), getCategoriesByType("CULINARY")]);
  return <CulinaryManager rows={rows} categories={categories} />;
}
