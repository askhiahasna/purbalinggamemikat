import { AccommodationManager } from "@/components/admin/managers";
import { getAccommodationsForAdmin } from "@/server/queries/accommodation";
import { requirePageRole } from "@/server/auth/dal";
import { CONTENT_ROLES } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export default async function AdminAkomodasiPage() {
  await requirePageRole(CONTENT_ROLES);
  const rows = await getAccommodationsForAdmin();
  return <AccommodationManager rows={rows} />;
}
