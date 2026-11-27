"use client";

import * as React from "react";
import { Inbox, MessageSquare, Megaphone, Store, Star, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  updateSubmissionAction,
  approveRegistrationAction,
  deleteSubmissionAction,
} from "@/server/actions/service-actions";
import type { getSubmissionsForAdmin, getSurveySummary } from "@/server/queries/submissions";

type Row = Awaited<ReturnType<typeof getSubmissionsForAdmin>>[number];
type Survey = Awaited<ReturnType<typeof getSurveySummary>>;
type Status = "PENDING" | "IN_REVIEW" | "RESOLVED";
type TypeKey = "ALL" | Row["type"];

const TYPE_TABS: { id: TypeKey; label: string; icon: React.ReactNode }[] = [
  { id: "ALL", label: "Semua", icon: <Inbox className="w-3.5 h-3.5" /> },
  { id: "COMPLAINT", label: "Pengaduan", icon: <Megaphone className="w-3.5 h-3.5" /> },
  { id: "CONTACT", label: "Kontak", icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { id: "OPERATOR_REGISTRATION", label: "Pendaftaran", icon: <Store className="w-3.5 h-3.5" /> },
  { id: "SURVEY", label: "Survei", icon: <Star className="w-3.5 h-3.5" /> },
];

const TYPE_LABEL: Record<Row["type"], string> = {
  COMPLAINT: "Pengaduan",
  CONTACT: "Kontak",
  OPERATOR_REGISTRATION: "Pendaftaran",
  SURVEY: "Survei",
};

const STATUS_LABEL: Record<Status, string> = { PENDING: "Baru", IN_REVIEW: "Diproses", RESOLVED: "Selesai" };
const STATUS_STYLE: Record<Status, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  IN_REVIEW: "bg-blue-50 text-blue-700 border-blue-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function SubmissionInbox({ rows, survey, canDelete }: { rows: Row[]; survey: Survey; canDelete: boolean }) {
  const [type, setType] = React.useState<TypeKey>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | Status>("ALL");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = React.useTransition();

  const counts = React.useMemo(() => {
    const c: Record<string, { all: number; pending: number }> = { ALL: { all: rows.length, pending: 0 } };
    for (const r of rows) {
      c[r.type] ??= { all: 0, pending: 0 };
      c[r.type].all++;
      if (r.status === "PENDING") {
        c[r.type].pending++;
        c.ALL.pending++;
      }
    }
    return c;
  }, [rows]);

  const visible = rows.filter((r) => (type === "ALL" || r.type === type) && (statusFilter === "ALL" || r.status === statusFilter));
  const selected = rows.find((r) => r.id === selectedId) ?? null;

  const flash = (ok: boolean, text: string) => {
    setNotice({ ok, text });
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-5">
        <Badge variant="primary" className="mb-1 text-[11px]">
          Layanan Interaktif
        </Badge>
        <h1 className="font-editorial text-3xl font-bold text-primary-950">Layanan Publik</h1>
        <p className="text-xs text-stone-500 font-body">
          Kotak masuk pengaduan, pertanyaan, pendaftaran usaha/wisata, dan hasil survei kepuasan dari masyarakat.
        </p>
      </div>

      {notice && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            notice.ok ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {notice.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {TYPE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setType(t.id);
              setSelectedId(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
              type === t.id ? "bg-primary-900 text-white border-primary-900" : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            }`}
          >
            {t.icon}
            {t.label}
            <span className={`text-[10px] px-1.5 rounded-full ${type === t.id ? "bg-white/20" : "bg-stone-100"}`}>
              {counts[t.id]?.all ?? 0}
            </span>
            {(counts[t.id]?.pending ?? 0) > 0 && <span className="w-2 h-2 rounded-full bg-amber-500" title="Ada yang baru" />}
          </button>
        ))}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "ALL" | Status)}
          aria-label="Filter status"
          className="ml-auto bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-medium"
        >
          <option value="ALL">Semua status</option>
          <option value="PENDING">Baru</option>
          <option value="IN_REVIEW">Diproses</option>
          <option value="RESOLVED">Selesai</option>
        </select>
      </div>

      {type === "SURVEY" && <SurveySummary s={survey} />}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <ul className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 overflow-hidden max-h-[70vh] overflow-y-auto">
          {visible.length === 0 && <li className="p-8 text-center text-xs text-stone-400">Tidak ada pesan.</li>}
          {visible.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setSelectedId(r.id)}
                className={`w-full text-left p-4 space-y-1 hover:bg-stone-50 cursor-pointer ${selectedId === r.id ? "bg-primary-50" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-stone-500">{TYPE_LABEL[r.type]}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${STATUS_STYLE[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                <p className="text-xs font-semibold text-stone-900 line-clamp-1">{r.subject}</p>
                <p className="text-[11px] text-stone-500 line-clamp-1">
                  {r.senderName}
                  {r.rating ? ` • ${"★".repeat(r.rating)}` : ""} • {r.createdAt}
                </p>
              </button>
            </li>
          ))}
        </ul>

        <div className="lg:col-span-3">
          {selected ? (
            <Detail
              key={selected.id}
              row={selected}
              canDelete={canDelete}
              pending={pending}
              onSave={(status, notes) =>
                startTransition(async () => {
                  const r = await updateSubmissionAction(selected.id, { status, notes });
                  flash(r.success, r.success ? "Penanganan disimpan." : r.error);
                })
              }
              onApprove={() =>
                startTransition(async () => {
                  const r = await approveRegistrationAction(selected.id);
                  flash(r.success, r.success ? "Draf UMKM dibuat. Lengkapi dan terbitkan di menu UMKM." : r.error);
                })
              }
              onDelete={() => {
                if (!confirm("Hapus pesan ini secara permanen?")) return;
                startTransition(async () => {
                  const r = await deleteSubmissionAction(selected.id);
                  if (r.success) setSelectedId(null);
                  flash(r.success, r.success ? "Pesan dihapus." : r.error);
                });
              }}
            />
          ) : (
            <div className="hidden lg:flex h-full min-h-48 items-center justify-center rounded-2xl border border-dashed border-stone-300 text-xs text-stone-400">
              Pilih pesan di sebelah kiri untuk melihat detail.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SurveySummary({ s }: { s: Survey }) {
  const max = Math.max(1, ...Object.values(s.dist));
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">Rata-rata kepuasan</p>
        <p className="font-editorial text-4xl font-bold text-primary-950">
          {s.count ? s.average : "–"}
          <span className="text-base text-stone-400"> / 5</span>
        </p>
        <p className="text-xs text-stone-500">dari {s.count} responden</p>
      </div>
      <div className="sm:col-span-2 space-y-1.5">
        {[5, 4, 3, 2, 1].map((n) => (
          <div key={n} className="flex items-center gap-2 text-xs">
            <span className="w-8 text-stone-600">{n} ★</span>
            <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
              <div className="h-full bg-secondary-500" style={{ width: `${(s.dist[n] / max) * 100}%` }} />
            </div>
            <span className="w-8 text-right text-stone-500">{s.dist[n]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Detail({
  row,
  canDelete,
  pending,
  onSave,
  onApprove,
  onDelete,
}: {
  row: Row;
  canDelete: boolean;
  pending: boolean;
  onSave: (status: Status, notes: string) => void;
  onApprove: () => void;
  onDelete: () => void;
}) {
  const [status, setStatus] = React.useState<Status>(row.status);
  const [notes, setNotes] = React.useState(row.notes);
  const canApprove = row.type === "OPERATOR_REGISTRATION" && row.businessKind === "UMKM" && !row.businessCreated;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 text-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant="primary" className="text-[10px] mb-1">
            {TYPE_LABEL[row.type]}
          </Badge>
          <h2 className="font-heading font-bold text-base text-stone-900">{row.subject}</h2>
          <p className="text-stone-500">{row.createdAt}</p>
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
            title="Hapus permanen"
            aria-label="Hapus pesan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Semua isi pengunjung dirender sebagai TEKS (React meng-escape), tanpa HTML. */}
      <dl className="grid grid-cols-3 gap-y-1.5">
        <dt className="text-stone-500">Pengirim</dt>
        <dd className="col-span-2 font-semibold text-stone-900">{row.senderName}</dd>
        <dt className="text-stone-500">Email</dt>
        <dd className="col-span-2 break-all">{row.senderEmail || "–"}</dd>
        <dt className="text-stone-500">WhatsApp</dt>
        <dd className="col-span-2">{row.senderPhone || "–"}</dd>
        {row.rating && (
          <>
            <dt className="text-stone-500">Penilaian</dt>
            <dd className="col-span-2 text-amber-600 font-bold">{"★".repeat(row.rating)} ({row.rating}/5)</dd>
          </>
        )}
        {row.type === "OPERATOR_REGISTRATION" && (
          <>
            <dt className="text-stone-500">Jenis</dt>
            <dd className="col-span-2">{row.businessKind === "WISATA" ? "Pengelola Wisata" : "UMKM"}</dd>
            <dt className="text-stone-500">Nama usaha</dt>
            <dd className="col-span-2 font-semibold">{row.businessName}</dd>
            <dt className="text-stone-500">Kecamatan</dt>
            <dd className="col-span-2">{row.district}</dd>
            <dt className="text-stone-500">Alamat</dt>
            <dd className="col-span-2">{row.address || "–"}</dd>
          </>
        )}
      </dl>

      <div>
        <p className="text-stone-500 mb-1">Isi pesan</p>
        <p className="whitespace-pre-wrap break-words bg-stone-50 border border-stone-200 rounded-lg p-3 text-stone-800 leading-relaxed">
          {row.message}
        </p>
      </div>

      <div className="border-t border-stone-100 pt-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="sub-status" className="block font-semibold text-stone-700 mb-1">
              Status
            </label>
            <select
              id="sub-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
            >
              <option value="PENDING">Baru</option>
              <option value="IN_REVIEW">Diproses</option>
              <option value="RESOLVED">Selesai</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="sub-notes" className="block font-semibold text-stone-700 mb-1">
              Catatan internal
            </label>
            <textarea
              id="sub-notes"
              rows={2}
              maxLength={2000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tindak lanjut, disposisi, dsb. (tidak tampil ke publik)"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-stone-400">{row.handledBy ? `Terakhir ditangani: ${row.handledBy}` : "Belum ditangani"}</span>
          <div className="flex items-center gap-2">
            {canApprove && (
              <Button type="button" variant="outline" size="sm" onClick={onApprove} disabled={pending}>
                Setujui & buat draf UMKM
              </Button>
            )}
            {row.type === "OPERATOR_REGISTRATION" && row.businessCreated && (
              <span className="text-emerald-700 font-semibold">✓ Draf UMKM sudah dibuat</span>
            )}
            <Button type="button" variant="secondary" size="sm" onClick={() => onSave(status, notes)} disabled={pending}>
              {pending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
