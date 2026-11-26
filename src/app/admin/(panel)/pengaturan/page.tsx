import { getSiteSettingsFresh } from "@/server/queries/settings";
import { SettingsForm } from "@/components/admin/settings-form";
import { requirePageRole } from "@/server/auth/dal";
import { ADMIN_ONLY } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export default async function PengaturanCmsPage() {
  await requirePageRole(ADMIN_ONLY);
  const settings = await getSiteSettingsFresh();
  return <SettingsForm initial={settings} />;
}
