import { ArticleManager } from "@/components/admin/managers";
import { getArticlesForAdmin, getCategoriesByType } from "@/server/queries/content";
import { requirePageRole } from "@/server/auth/dal";
import { CONTENT_ROLES } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export default async function AdminBeritaPage() {
  await requirePageRole(CONTENT_ROLES);
  const [rows, categories] = await Promise.all([getArticlesForAdmin(), getCategoriesByType("ARTICLE")]);
  return <ArticleManager rows={rows} categories={categories} />;
}
