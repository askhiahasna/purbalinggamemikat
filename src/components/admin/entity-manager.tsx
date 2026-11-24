"use client";

import * as React from "react";
import { Plus, Search, Edit, Trash2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ActionResult } from "@/server/actions/cms-actions";
import { ImageUploader, type UploadScope } from "./image-uploader";

export type FieldValue = string | boolean;
export type FormValues = Record<string, FieldValue>;

export interface FieldDef {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "datetime-local" | "password" | "multicheck" | "image";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Isi satu baris penuh (default setengah lebar). */
  full?: boolean;
  rows?: number;
  hint?: string;
  /** Untuk type "image": folder penyimpanan. */
  scope?: UploadScope;
  /** Tampilkan field hanya bila kondisi terpenuhi (mis. berdasarkan role yang dipilih). */
  showIf?: (values: FormValues) => boolean;
}

export interface ColumnDef<T> {
  header: string;
  render: (row: T) => React.ReactNode;
}

interface Props<T extends { id: string }> {
  badge: string;
  title: string;
  subtitle: string;
  addLabel: string;
  entityLabel: string;
  searchPlaceholder: string;
  rows: T[];
  columns: ColumnDef<T>[];
  fields: FieldDef[];
  emptyForm: FormValues;
  toForm: (row: T) => FormValues;
  searchText: (row: T) => string;
  rowName: (row: T) => string;
  canDelete?: (row: T) => boolean;
  create: (values: FormValues) => Promise<ActionResult>;
  update: (id: string, values: FormValues) => Promise<ActionResult>;
  remove: (id: string) => Promise<ActionResult>;
}

const inputCls =
  "w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-primary-800";

export function EntityManager<T extends { id: string }>(props: Props<T>) {
  const { rows, columns, fields } = props;
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [values, setValues] = React.useState<FormValues>(props.emptyForm);
  const [formError, setFormError] = React.useState("");
  const [notice, setNotice] = React.useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = React.useTransition();

  const flash = (ok: boolean, text: string) => {
    setNotice({ ok, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const filtered = rows.filter((r) => props.searchText(r).toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditingId(null);
    setValues(props.emptyForm);
    setFormError("");
    setOpen(true);
  };

  const openEdit = (row: T) => {
    setEditingId(row.id);
    setValues(props.toForm(row));
    setFormError("");
    setOpen(true);
  };

  const handleDelete = (row: T) => {
    const name = props.rowName(row);
    if (!confirm(`Yakin ingin menghapus ${props.entityLabel} "${name}"?`)) return;
    startTransition(async () => {
      const res = await props.remove(row.id);
      flash(res.success, res.success ? `"${name}" berhasil dihapus.` : res.error);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    startTransition(async () => {
      const res = editingId ? await props.update(editingId, values) : await props.create(values);
      if (res.success) {
        setOpen(false);
        flash(true, editingId ? "Perubahan berhasil disimpan." : `${props.entityLabel} baru berhasil ditambahkan!`);
      } else {
        setFormError(res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <Badge variant="secondary" className="mb-1 text-[11px]">
            {props.badge}
          </Badge>
          <h1 className="font-editorial text-3xl font-bold text-primary-950">{props.title}</h1>
          <p className="text-xs text-stone-500 font-body">{props.subtitle}</p>
        </div>
        <Button onClick={openCreate} variant="secondary" size="md" className="shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>{props.addLabel}</span>
        </Button>
      </div>

      {notice && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            notice.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {notice.ok ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={props.searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-primary-800"
          />
        </div>
        <span className="text-[11px] text-stone-500">{filtered.length} data</span>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
              <tr>
                {columns.map((c) => (
                  <th key={c.header} className="py-3.5 px-4">
                    {c.header}
                  </th>
                ))}
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="py-10 text-center text-stone-400">
                    Belum ada data.
                  </td>
                </tr>
              )}
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-stone-50 transition-colors">
                  {columns.map((c) => (
                    <td key={c.header} className="py-3.5 px-4">
                      {c.render(row)}
                    </td>
                  ))}
                  <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-primary-800 hover:bg-stone-100 inline-flex cursor-pointer"
                      title="Sunting"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {(props.canDelete ? props.canDelete(row) : true) && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleDelete(row)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 inline-flex cursor-pointer disabled:opacity-50"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-heading font-bold text-base text-stone-900">
                {editingId ? `Sunting ${props.entityLabel}` : props.addLabel}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fields.filter((f) => !f.showIf || f.showIf(values)).map((f) => (
                  <div
                    key={f.name}
                    className={f.full || f.type === "textarea" || f.type === "multicheck" || f.type === "image" ? "sm:col-span-2" : ""}
                  >
                    {f.type === "image" ? (
                      <ImageUploader
                        scope={f.scope ?? "berita"}
                        entityId={editingId}
                        label={f.label}
                        value={String(values[f.name] ?? "")}
                        onChange={(url) => setValues({ ...values, [f.name]: url })}
                      />
                    ) : f.type === "multicheck" ? (
                      <fieldset>
                        <legend className="block font-semibold text-stone-700 mb-1">{f.label}</legend>
                        <div className="max-h-40 overflow-y-auto rounded-lg border border-stone-200 bg-stone-50 p-2 space-y-1">
                          {f.options?.length ? (
                            f.options.map((o) => {
                              const selected = String(values[f.name] ?? "").split(",").filter(Boolean);
                              return (
                                <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selected.includes(o.value)}
                                    onChange={(e) => {
                                      const next = e.target.checked
                                        ? [...selected, o.value]
                                        : selected.filter((x) => x !== o.value);
                                      setValues({ ...values, [f.name]: next.join(",") });
                                    }}
                                  />
                                  {o.label}
                                </label>
                              );
                            })
                          ) : (
                            <span className="text-stone-400">Belum ada pilihan.</span>
                          )}
                        </div>
                      </fieldset>
                    ) : f.type === "checkbox" ? (
                      <label className="flex items-center gap-2 font-semibold text-stone-700 pt-5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={values[f.name] === true}
                          onChange={(e) => setValues({ ...values, [f.name]: e.target.checked })}
                        />
                        {f.label}
                      </label>
                    ) : (
                      <>
                        <label htmlFor={`f-${f.name}`} className="block font-semibold text-stone-700 mb-1">
                          {f.label}
                          {f.required && " *"}
                        </label>
                        {f.type === "textarea" ? (
                          <textarea
                            id={`f-${f.name}`}
                            rows={f.rows ?? 3}
                            required={f.required}
                            value={String(values[f.name] ?? "")}
                            placeholder={f.placeholder}
                            onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                            className={inputCls}
                          />
                        ) : f.type === "select" ? (
                          <select
                            id={`f-${f.name}`}
                            required={f.required}
                            value={String(values[f.name] ?? "")}
                            onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                            className={inputCls}
                          >
                            {!f.required && <option value="">— Tanpa kategori —</option>}
                            {f.options?.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={`f-${f.name}`}
                            type={f.type}
                            autoComplete={f.type === "password" ? "new-password" : undefined}
                            required={f.required && !(f.type === "password" && editingId)}
                            value={String(values[f.name] ?? "")}
                            placeholder={f.placeholder}
                            onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                            className={inputCls}
                          />
                        )}
                        {f.hint && <p className="mt-1 text-[11px] text-stone-400">{f.hint}</p>}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="secondary" size="sm" disabled={pending}>
                  {pending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export const STATUS_OPTIONS = [
  { value: "PUBLISHED", label: "Published (tampil di publik)" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVED", label: "Arsip" },
];

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "PUBLISHED"
      ? "bg-emerald-50 text-emerald-700"
      : status === "DRAFT"
        ? "bg-amber-50 text-amber-700"
        : "bg-stone-100 text-stone-600";
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cls}`}>{status}</span>;
}
