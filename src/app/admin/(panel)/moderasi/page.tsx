import { ReviewModeration } from "@/components/admin/review-moderation";
import { getReviewsForModeration } from "@/server/queries/content";
import { requirePageRole } from "@/server/auth/dal";
import { CONTENT_ROLES } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export default async function AdminModerasiPage() {
  await requirePageRole(CONTENT_ROLES);
  const reviews = await getReviewsForModeration();
  return <ReviewModeration reviews={reviews} />;
}
