import { DataTools } from "@/components/admin/data-tools";
import { ENTITIES } from "@/server/import-export/entities";
import { requirePageRole } from "@/server/auth/dal";
import { CONTENT_ROLES } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export default async function AdminDataPage() {
  await requirePageRole(CONTENT_ROLES);
  const entities = Object.values(ENTITIES).map((e) => ({ key: e.key, label: e.label, importable: !!e.importer }));
  return <DataTools entities={entities} />;
}
