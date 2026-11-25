"use client";

import * as React from "react";
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EntityInfo {
  key: string;
  label: string;
  importable: boolean;
}

interface RowResult {
  row: number;
  label: string;
  action: "create" | "update" | "error";
  message?: string;
}
interface ImportResponse {
  mode: "preview" | "commit";
  total: number;
  summary: { create: number; update: number; error: number };
  ignoredColumns: string[];
  rows: RowResult[];
}

const ACTION_LABEL = { create: "Baru", update: "Perbarui", error: "Gagal" } as const;
const ACTION_STYLE = {
  create: "bg-emerald-50 text-emerald-700 border-emerald-200",
  update: "bg-blue-50 text-blue-700 border-blue-200",
  error: "bg-rose-50 text-rose-700 border-rose-200",
} as const;

export function DataTools({ entities }: { entities: EntityInfo[] }) {
  const importable = entities.filter((e) => e.importable);
  const [entity, setEntity] = React.useState(importable[0]?.key ?? "");
  const [file, setFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState<"preview" | "commit" | null>(null);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<ImportResponse | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const send = async (mode: "preview" | "commit") => {
    if (!file) return;
    setBusy(mode);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("mode", mode);
      const res = await fetch(`/admin/data/import/${entity}`, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({ error: "Respons server tidak valid." }));
      if (!res.ok) {
        setError(data.error ?? "Gagal memproses file.");
        setResult(null);
      } else {
        setResult(data as ImportResponse);
      }
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setBusy(null);
    }
  };

  const link = "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-200 bg-white text-stone-700 font-semibold hover:bg-stone-50";

  return (
    <div className="space-y-8">
      <div className="border-b border-stone-200 pb-5">
        <Badge variant="primary" className="mb-1 text-[11px]">
          Data & Laporan
        </Badge>
        <h1 className="font-editorial text-3xl font-bold text-primary-950">Impor & Ekspor Data</h1>
        <p className="text-xs text-stone-500 font-body">Unduh data konten sebagai Excel/CSV, atau perbarui banyak data sekaligus lewat file.</p>
      </div>

      {/* EKSPOR */}
      <section className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
        <h2 className="flex items-center gap-2 font-heading font-bold text-base text-stone-900">
          <Download className="w-5 h-5 text-secondary-500" /> Ekspor
        </h2>
        <ul className="divide-y divide-stone-100 text-xs">
          {entities.map((e) => (
            <li key={e.key} className="py-3 flex flex-wrap items-center justify-between gap-3">
              <span className="font-semibold text-stone-800">{e.label}</span>
              <span className="flex flex-wrap items-center gap-2">
                <a className={link} href={`/admin/data/export/${e.key}?format=xlsx`} download>
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                </a>
                <a className={link} href={`/admin/data/export/${e.key}?format=csv`} download>
                  CSV
                </a>
                {e.importable && (
                  <a className="text-stone-500 hover:text-primary-800 underline underline-offset-2" href={`/admin/data/export/${e.key}?format=xlsx&template=1`} download>
                    Unduh templat
                  </a>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* IMPOR */}
      <section className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4 text-xs">
        <h2 className="flex items-center gap-2 font-heading font-bold text-base text-stone-900">
          <Upload className="w-5 h-5 text-secondary-500" /> Impor
        </h2>
        <ul className="list-disc pl-5 text-stone-500 space-y-0.5">
          <li>Gunakan templat atau hasil ekspor. Baris dengan <strong>slug</strong> yang sudah ada akan <strong>diperbarui</strong>; selain itu dibuat baru.</li>
          <li>Baris baru tanpa kolom <em>status</em> disimpan sebagai <strong>draf</strong> agar bisa ditinjau sebelum tayang.</li>
          <li>Foto tidak diimpor lewat file (foto yang ada tetap dipertahankan). Maksimal 100 baris dan 2 MB per file.</li>
          <li>Selalu klik <strong>Periksa file</strong> dahulu. Baris yang salah dilewati dan dilaporkan; baris yang benar tetap diproses.</li>
        </ul>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label htmlFor="imp-entity" className="block font-semibold text-stone-700 mb-1">
              Jenis data
            </label>
            <select
              id="imp-entity"
              value={entity}
              onChange={(e) => {
                setEntity(e.target.value);
                reset();
              }}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
            >
              {importable.map((e) => (
                <option key={e.key} value={e.key}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="imp-file" className="block font-semibold text-stone-700 mb-1">
              File (.xlsx / .csv)
            </label>
            <input
              id="imp-file"
              ref={inputRef}
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setResult(null);
                setError("");
              }}
              className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg file:mr-3 file:border-0 file:bg-primary-800 file:text-white file:px-3 file:py-1 file:rounded-md"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={!file || busy !== null} onClick={() => send("preview")}>
            {busy === "preview" ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
            Periksa file
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!file || busy !== null || !result || result.mode !== "preview" || result.summary.create + result.summary.update === 0}
            onClick={() => send("commit")}
          >
            {busy === "commit" ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
            Impor sekarang
          </Button>
          {(file || result) && (
            <button type="button" onClick={reset} className="text-stone-500 hover:text-stone-800 underline underline-offset-2 cursor-pointer">
              Ulangi
            </button>
          )}
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="space-y-3" aria-live="polite">
            <div
              className={`p-3 rounded-lg border flex items-start gap-2 ${
                result.mode === "commit" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {result.mode === "commit" ? "Impor selesai: " : "Hasil pemeriksaan (belum ada yang disimpan): "}
                <strong>{result.summary.create}</strong> baru, <strong>{result.summary.update}</strong> diperbarui,{" "}
                <strong>{result.summary.error}</strong> gagal dari {result.total} baris.
                {result.ignoredColumns.length > 0 && <> Kolom diabaikan: {result.ignoredColumns.join(", ")}.</>}
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-stone-200 max-h-96 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-600 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Baris</th>
                    <th className="py-2 px-3">Data</th>
                    <th className="py-2 px-3">Hasil</th>
                    <th className="py-2 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {result.rows.map((r) => (
                    <tr key={r.row}>
                      <td className="py-2 px-3 text-stone-500">{r.row}</td>
                      <td className="py-2 px-3 font-semibold text-stone-800">{r.label}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${ACTION_STYLE[r.action]}`}>{ACTION_LABEL[r.action]}</span>
                      </td>
                      <td className="py-2 px-3 text-rose-700">{r.message ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
