import { authorize } from "@/server/auth/dal";
import { CONTENT_ROLES } from "@/lib/auth/permissions";
import { ENTITIES, isEntityKey } from "@/server/import-export/entities";
import { buildFile } from "@/server/import-export/files";

export const dynamic = "force-dynamic";

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

/** GET /admin/data/export/<entitas>?format=xlsx|csv[&template=1] — hanya SUPER_ADMIN & EDITOR. */
export async function GET(req: Request, ctx: { params: Promise<{ entity: string }> }) {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return json({ error: auth.error }, 401);

  const { entity: key } = await ctx.params;
  if (!isEntityKey(key)) return json({ error: "Entitas tidak dikenal." }, 404);
  const entity = ENTITIES[key];

  const url = new URL(req.url);
  const format = url.searchParams.get("format") === "csv" ? "csv" : "xlsx";
  const template = url.searchParams.get("template") === "1";
  if (template && !entity.importer) return json({ error: "Entitas ini tidak memiliki templat impor." }, 404);

  try {
    const rows = template ? [entity.example] : await entity.exportRows();
    const file = await buildFile(entity, rows, format);
    const stamp = new Date().toISOString().slice(0, 10);
    const name = `${key}-${template ? "templat" : "ekspor"}-${stamp}.${file.ext}`;
    return new Response(new Uint8Array(file.body), {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    console.error(e);
    return json({ error: "Gagal membuat file ekspor." }, 500);
  }
}
