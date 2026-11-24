import { EventManager } from "@/components/admin/managers";
import { getEventsForAdmin, getCategoriesByType } from "@/server/queries/content";
import { requirePageRole } from "@/server/auth/dal";
import { CONTENT_ROLES } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export default async function AdminEventPage() {
  await requirePageRole(CONTENT_ROLES);
  const [rows, categories] = await Promise.all([getEventsForAdmin(), getCategoriesByType("EVENT")]);
  return <EventManager rows={rows} categories={categories} />;
}
