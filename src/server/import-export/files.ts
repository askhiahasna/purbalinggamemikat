import ExcelJS from "exceljs";
import { Readable } from "stream";
import { ENTITIES, type Cell, type EntityIO, type Row } from "./entities";

export const MAX_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 100;

/**
 * Cegah "CSV/formula injection": sel teks yang diawali = + - @ (atau tab/CR) dapat dijalankan
 * sebagai rumus oleh Excel. Diberi awalan tanda petik; saat diimpor kembali awalan itu dibuang.
 */
export function sanitizeCell(v: Cell): Cell {
  // Angka murni (mis. koordinat "-7.2500") aman dan tidak diberi tanda petik; rumus seperti "-2+3" tetap diamankan.
  if (typeof v === "string" && /^[=+\-@\t\r]/.test(v) && !/^[+-]?\d+(\.\d+)?$/.test(v)) return `'${v}`;
  return v;
}
export function unsanitizeCell(s: string): string {
  return /^'[=+\-@\t\r]/.test(s) ? s.slice(1) : s;
}

export async function buildFile(
  entity: EntityIO,
  rows: Record<string, Cell>[],
  format: "xlsx" | "csv"
): Promise<{ body: Buffer; contentType: string; ext: string }> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Purbalingga Memikat";
  const ws = wb.addWorksheet(entity.label.slice(0, 31));
  ws.columns = entity.columns.map((c) => ({ header: c.key, key: c.key, width: Math.max(14, c.key.length + 4) }));
  for (const r of rows) ws.addRow(Object.fromEntries(entity.columns.map((c) => [c.key, sanitizeCell(r[c.key] ?? null)])));
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 1 }];

  if (format === "csv") {
    const buf = Buffer.from(await wb.csv.writeBuffer());
    // BOM agar Excel membaca UTF-8 (huruf Indonesia/simbol) dengan benar.
    return { body: Buffer.concat([Buffer.from("﻿", "utf8"), buf]), contentType: "text/csv; charset=utf-8", ext: "csv" };
  }
  const buf = Buffer.from(await wb.xlsx.writeBuffer());
  return { body: buf, contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ext: "xlsx" };
}

/** Nilai sel exceljs (string/angka/tanggal/rumus/hyperlink/rich text) -> teks polos. */
function cellText(v: ExcelJS.CellValue): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return unsanitizeCell(v.trim());
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) {
    // Excel menyimpan "waktu dinding"; exceljs mengembalikannya sebagai UTC -> pakai komponen UTC.
    const p = (n: number) => String(n).padStart(2, "0");
    return `${v.getUTCFullYear()}-${p(v.getUTCMonth() + 1)}-${p(v.getUTCDate())} ${p(v.getUTCHours())}:${p(v.getUTCMinutes())}`;
  }
  if (typeof v === "object") {
    const o = v as unknown as Record<string, unknown>;
    if (Array.isArray(o.richText)) return (o.richText as { text: string }[]).map((t) => t.text).join("").trim();
    if ("result" in o && o.result !== undefined) return cellText(o.result as ExcelJS.CellValue); // nilai hasil rumus, bukan rumusnya
    if (typeof o.text === "string") return o.text.trim();
    if ("error" in o) return "";
  }
  return String(v).trim();
}

const normHeader = (s: string) => s.toLowerCase().trim().replace(/[\s-]+/g, "_");

export interface ParsedSheet {
  rows: Row[];
  headers: string[];
  missingColumns: string[];
  ignoredColumns: string[];
}

export async function parseUpload(buffer: Buffer, filename: string, entity: EntityIO): Promise<ParsedSheet> {
  const ext = filename.toLowerCase().split(".").pop();
  const wb = new ExcelJS.Workbook();
  let ws: ExcelJS.Worksheet | undefined;

  if (ext === "xlsx") {
    await wb.xlsx.load(buffer as unknown as ArrayBuffer);
    ws = wb.worksheets[0];
  } else if (ext === "csv") {
    const text = buffer.toString("utf8").replace(/^﻿/, "");
    const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
    const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ","; // Excel Indonesia memakai ';'
    ws = await wb.csv.read(Readable.from(Buffer.from(text, "utf8")), { parserOptions: { delimiter } });
  } else {
    throw new Error("Format file harus .xlsx atau .csv");
  }
  if (!ws || ws.rowCount < 1) throw new Error("File kosong atau lembar pertama tidak terbaca.");

  const headerRow = ws.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, col) => {
    headers[col] = normHeader(cellText(cell.value));
  });

  const known = new Set(entity.columns.map((c) => c.key));
  const present = new Set(headers.filter(Boolean));
  const missingColumns = entity.columns.filter((c) => c.required && !present.has(c.key)).map((c) => c.key);
  const ignoredColumns = [...present].filter((h) => !known.has(h));

  const rows: Row[] = [];
  for (let r = 2; r <= ws.rowCount; r++) {
    const row: Row = {};
    let any = false;
    for (const c of entity.columns) {
      const idx = headers.indexOf(c.key);
      const val = idx > 0 ? cellText(ws.getRow(r).getCell(idx).value) : "";
      row[c.key] = val;
      if (val) any = true;
    }
    if (any) rows.push(row);
    if (rows.length > MAX_IMPORT_ROWS) throw new Error(`Maksimal ${MAX_IMPORT_ROWS} baris per file. Bagi file menjadi beberapa bagian.`);
  }
  return { rows, headers: headers.filter(Boolean), missingColumns, ignoredColumns };
}

export interface RowResult {
  row: number; // nomor baris di file (header = 1)
  label: string;
  action: "create" | "update" | "error";
  message?: string;
}

/** mode "preview": validasi saja (tanpa menulis). mode "commit": menulis baris yang valid; baris gagal dilaporkan. */
export async function runImport(entity: EntityIO, rows: Row[], mode: "preview" | "commit"): Promise<RowResult[]> {
  const imp = entity.importer;
  if (!imp) throw new Error("Entitas ini tidak mendukung impor.");
  const out: RowResult[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const rowNo = i + 2;
    const row = rows[i];
    const label = row[entity.columns.find((c) => c.required)?.key ?? "nama"] || `(baris ${rowNo})`;
    try {
      const missing = entity.columns.filter((c) => c.required && !row[c.key]).map((c) => c.key);
      if (missing.length) {
        out.push({ row: rowNo, label, action: "error", message: `Kolom wajib kosong: ${missing.join(", ")}` });
        continue;
      }
      if (row.slug) {
        if (seen.has(row.slug)) {
          out.push({ row: rowNo, label, action: "error", message: `Slug "${row.slug}" muncul dua kali di file` });
          continue;
        }
        seen.add(row.slug);
      }
      const prep = await imp.prepare(row);
      if ("error" in prep) {
        out.push({ row: rowNo, label, action: "error", message: prep.error });
        continue;
      }
      const parsed = imp.schema.safeParse(prep.input);
      if (!parsed.success) {
        out.push({ row: rowNo, label, action: "error", message: parsed.error.issues[0]?.message ?? "Data tidak valid" });
        continue;
      }
      if (mode === "preview") {
        out.push({ row: rowNo, label, action: prep.mode });
        continue;
      }
      const res = prep.mode === "update" && prep.id ? await imp.update(prep.id, prep.input) : await imp.create(prep.input);
      out.push(res.success ? { row: rowNo, label, action: prep.mode } : { row: rowNo, label, action: "error", message: res.error });
    } catch (e) {
      console.error(e);
      out.push({ row: rowNo, label, action: "error", message: "Terjadi kesalahan saat memproses baris ini" });
    }
  }
  return out;
}

export { ENTITIES };
