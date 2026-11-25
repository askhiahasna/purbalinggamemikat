import { authorize } from "@/server/auth/dal";
import { CONTENT_ROLES } from "@/lib/auth/permissions";
import { ENTITIES, isEntityKey } from "@/server/import-export/entities";
import { MAX_FILE_BYTES, parseUpload, runImport } from "@/server/import-export/files";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

/**
 * POST /admin/data/import/<entitas> (multipart: file, mode=preview|commit).
 * Hanya SUPER_ADMIN & EDITOR. Validasi memakai skema yang sama dengan form admin.
 */
export async function POST(req: Request, ctx: { params: Promise<{ entity: string }> }) {
  // Pertahanan CSRF tambahan: permintaan lintas-situs ditolak.
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin) {
    try {
      if (new URL(origin).host !== host) return json({ error: "Permintaan ditolak (origin tidak cocok)." }, 403);
    } catch {
      return json({ error: "Permintaan ditolak." }, 403);
    }
  }

  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return json({ error: auth.error }, 401);

  const { entity: key } = await ctx.params;
  if (!isEntityKey(key) || !ENTITIES[key].importer) return json({ error: "Entitas ini tidak mendukung impor." }, 404);
  const entity = ENTITIES[key];

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "Permintaan tidak valid." }, 400);
  }
  const file = form.get("file");
  const mode = form.get("mode") === "commit" ? "commit" : "preview";
  if (!(file instanceof File) || file.size === 0) return json({ error: "Pilih file .xlsx atau .csv terlebih dahulu." }, 400);
  if (file.size > MAX_FILE_BYTES) return json({ error: "Ukuran file maksimal 2 MB." }, 413);
  if (!/\.(xlsx|csv)$/i.test(file.name)) return json({ error: "Format file harus .xlsx atau .csv." }, 400);

  try {
    const sheet = await parseUpload(Buffer.from(await file.arrayBuffer()), file.name, entity);
    if (sheet.missingColumns.length) {
      return json({ error: `Kolom wajib tidak ditemukan: ${sheet.missingColumns.join(", ")}. Unduh templat untuk melihat format yang benar.` }, 422);
    }
    if (sheet.rows.length === 0) return json({ error: "Tidak ada baris data di file." }, 422);

    const results = await runImport(entity, sheet.rows, mode);
    const summary = {
      create: results.filter((r) => r.action === "create").length,
      update: results.filter((r) => r.action === "update").length,
      error: results.filter((r) => r.action === "error").length,
    };
    return json({ mode, entity: key, total: results.length, summary, ignoredColumns: sheet.ignoredColumns, rows: results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    // Pesan yang kita lempar sendiri aman ditampilkan; error pustaka umum diganti pesan generik.
    const safe = /^(Format file|File kosong|Maksimal)/.test(msg) ? msg : "File tidak dapat dibaca. Pastikan formatnya benar dan tidak rusak.";
    if (!/^(Format file|File kosong|Maksimal)/.test(msg)) console.error(e);
    return json({ error: safe }, 422);
  }
}
