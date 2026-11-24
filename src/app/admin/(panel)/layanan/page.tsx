import { SubmissionInbox } from "@/components/admin/submission-inbox";
import { getSubmissionsForAdmin, getSurveySummary } from "@/server/queries/submissions";
import { requirePageRole } from "@/server/auth/dal";
import { CONTENT_ROLES } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export default async function AdminLayananPage() {
  const user = await requirePageRole(CONTENT_ROLES);
  const [rows, survey] = await Promise.all([getSubmissionsForAdmin(), getSurveySummary()]);
  return <SubmissionInbox rows={rows} survey={survey} canDelete={user.role === "SUPER_ADMIN"} />;
}
