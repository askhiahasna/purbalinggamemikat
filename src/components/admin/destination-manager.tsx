"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Images,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DestinationDetail } from "@/types/destination";
import { formatRupiah } from "@/lib/utils";
import type { AppRole } from "@/lib/auth/permissions";
import { GalleryManager } from "./gallery-manager";
import { CoordinatePicker } from "./coordinate-picker";
import {
  createDestinationAction,
  updateDestinationAction,
  deleteDestinationAction,
  type DestinationInput,
} from "@/server/actions/cms-actions";

type AdminDestination = DestinationDetail & {
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  managerId: string;
  coordLat: string;
  coordLng: string;
};

const EMPTY_FORM = (categorySlug: string): DestinationInput => ({
  name: "",
  categorySlug,
  district: "Karangreja",
  ticketPriceWeekday: 20000,
  ticketPriceWeekend: 25000,
  openingHours: "08.00 - 17.00 WIB",
  summary: "",
  latitude: "",
  longitude: "",
  status: "PUBLISHED",
});

export function DestinationManager({
  items,
  categories,
  managers,
  role,
}: {
  items: AdminDestination[];
  categories: { slug: string; name: string }[];
  managers: { id: string; name: string }[];
  role: AppRole;
}) {
  const isManager = role === "DESTINATION_MANAGER";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const [search, setSearch] = React.useState("");
  const [filterCat, setFilterCat] = React.useState("semua");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [galleryId, setGalleryId] = React.useState<string | null>(null);
  const galleryItem = items.find((d) => d.id === galleryId);
  const [notification, setNotification] = React.useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = React.useTransition();
  const [formData, setFormData] = React.useState<DestinationInput>(
    EMPTY_FORM(categories[0]?.slug ?? "")
  );

  const notify = (ok: boolean, text: string) => {
    setNotification({ ok, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const filtered = items.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = d.name.toLowerCase().includes(q) || d.district.toLowerCase().includes(q);
    const matchCat = filterCat === "semua" || d.category === filterCat;
    return matchSearch && matchCat;
  });

  const openCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM(categories[0]?.slug ?? ""));
    setIsModalOpen(true);
  };

  const openEdit = (d: AdminDestination) => {
    setEditingId(d.id);
    setFormData({
      name: d.name,
      categorySlug: d.category,
      district: d.district,
      address: d.address,
      summary: d.summary,
      description: d.description,
      ticketPriceWeekday: d.ticketWeekday,
      ticketPriceWeekend: d.ticketWeekend,
      openingHours: d.openingHours === "-" ? "" : d.openingHours,
      status: d.status,
      managerId: d.managerId,
      latitude: d.coordLat,
      longitude: d.coordLng,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus destinasi "${name}"?`)) return;
    startTransition(async () => {
      const res = await deleteDestinationAction(id);
      notify(res.success, res.success ? `Destinasi "${name}" berhasil dihapus.` : res.error);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = editingId
        ? await updateDestinationAction(editingId, formData)
        : await createDestinationAction(formData);
      if (res.success) {
        setIsModalOpen(false);
        notify(true, editingId ? "Destinasi berhasil diperbarui." : "Destinasi berhasil ditambahkan!");
      } else {
        notify(false, res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <Badge variant="primary" className="mb-1 text-[11px]">
            Manajemen Konten
          </Badge>
          <h1 className="font-editorial text-3xl font-bold text-primary-950">
            Destinasi Wisata
          </h1>
          <p className="text-xs text-stone-500 font-body">
            Kelola data objek wisata, tiket masuk, jam operasional, dan galeri foto.
          </p>
        </div>

        {!isManager && (
        <Button
          onClick={openCreate}
          variant="secondary"
          size="md"
          className="shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Tambah Destinasi Baru</span>
        </Button>
        )}
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            notification.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {notification.ok ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama destinasi atau kecamatan..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-primary-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-500" />
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-primary-800 font-medium"
          >
            <option value="semua">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Nama Destinasi</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Kecamatan</th>
                <th className="py-3.5 px-4">Tiket Masuk</th>
                <th className="py-3.5 px-4">Jam Buka</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-heading font-semibold text-stone-900">
                      {item.name}
                      {item.status !== "PUBLISHED" && (
                        <span className="ml-2 text-[10px] font-bold text-stone-500 uppercase">{item.status}</span>
                      )}
                    </p>
                    <p className="text-[11px] text-stone-400 line-clamp-1">{item.summary}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="primary" className="text-[10px]">
                      {item.categoryLabel}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="flex items-center gap-1 text-stone-600">
                      <MapPin className="w-3.5 h-3.5 text-secondary-500" />
                      Kec. {item.district}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-primary-900">
                    {formatRupiah(item.ticketWeekday)}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500">{item.openingHours}</td>
                  <td className="py-3.5 px-4 font-bold text-amber-600">{item.reviewCount ? `★ ${item.rating}` : "-"}</td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <Link
                      href={`/destinasi/${item.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 inline-flex"
                      title="Lihat Pratinjau Publik"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setGalleryId(item.id)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-primary-800 hover:bg-stone-100 inline-flex cursor-pointer"
                      title={`Galeri foto (${item.images.length})`}
                    >
                      <Images className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-primary-800 hover:bg-stone-100 inline-flex cursor-pointer"
                      title="Sunting"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {!isManager && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 inline-flex cursor-pointer"
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

      {galleryItem && (
        <GalleryManager
          destinationId={galleryItem.id}
          destinationName={galleryItem.name}
          images={galleryItem.images}
          onClose={() => setGalleryId(null)}
        />
      )}

      {/* Modal Tambah Destinasi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-heading font-bold text-base text-stone-900">
                {editingId ? "Sunting Destinasi Wisata" : "Tambah Destinasi Wisata Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Objek Wisata *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Curug Silangit..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-primary-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={formData.categorySlug}
                    onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-primary-800"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Kecamatan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-primary-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tiket Weekday (Rp)
                  </label>
                  <input
                    type="number"
                    value={Number(formData.ticketPriceWeekday)}
                    onChange={(e) => setFormData({ ...formData, ticketPriceWeekday: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-primary-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tiket Weekend (Rp)
                  </label>
                  <input
                    type="number"
                    value={Number(formData.ticketPriceWeekend)}
                    onChange={(e) => setFormData({ ...formData, ticketPriceWeekend: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-primary-800"
                  />
                </div>
              </div>

              <CoordinatePicker
                lat={String(formData.latitude ?? "")}
                lng={String(formData.longitude ?? "")}
                onChange={(la, ln) => setFormData({ ...formData, latitude: la, longitude: ln })}
              />

              {!isManager && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Status</label>
                    <select
                      value={formData.status ?? "PUBLISHED"}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED" })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-primary-800"
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                      <option value="ARCHIVED">Arsip</option>
                    </select>
                  </div>
                  {isSuperAdmin && (
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Pengelola Ditugaskan</label>
                      <select
                        value={formData.managerId ?? ""}
                        onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-primary-800"
                      >
                        <option value="">— Belum ditugaskan —</option>
                        {managers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Ringkasan Singkat
                </label>
                <textarea
                  rows={2}
                  value={formData.summary ?? ""}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Ringkasan singkat untuk tampilan kartu..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-primary-800"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="secondary" size="sm" disabled={pending}>
                  {pending ? "Menyimpan..." : "Simpan Destinasi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
