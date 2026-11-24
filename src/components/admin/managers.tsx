"use client";

import { Badge } from "@/components/ui/badge";
import { EntityManager, STATUS_OPTIONS, StatusBadge, type FieldDef, type FormValues } from "./entity-manager";
import {
  createCulinaryAction,
  updateCulinaryAction,
  deleteCulinaryAction,
  createEventAction,
  updateEventAction,
  deleteEventAction,
  createBusinessAction,
  updateBusinessAction,
  deleteBusinessAction,
  createArticleAction,
  updateArticleAction,
  deleteArticleAction,
} from "@/server/actions/content-actions";
import type {
  getCulinaryForAdmin,
  getEventsForAdmin,
  getBusinessesForAdmin,
  getArticlesForAdmin,
} from "@/server/queries/content";

type Cat = { id: string; name: string }[];
const catOptions = (c: Cat) => c.map((x) => ({ value: x.id, label: x.name }));
const statusField: FieldDef = { name: "status", label: "Status", type: "select", required: true, options: STATUS_OPTIONS };
const districtField: FieldDef = { name: "district", label: "Kecamatan", type: "text", required: true };

/* ------------------------------ Kuliner ----------------------------- */

type CulinaryRow = Awaited<ReturnType<typeof getCulinaryForAdmin>>[number];

export function CulinaryManager({ rows, categories }: { rows: CulinaryRow[]; categories: Cat }) {
  const fields: FieldDef[] = [
    { name: "name", label: "Nama Kuliner", type: "text", required: true, full: true },
    { name: "categoryId", label: "Kategori", type: "select", options: catOptions(categories) },
    districtField,
    { name: "priceRange", label: "Kisaran Harga", type: "text", placeholder: "Rp 10.000 - Rp 25.000" },
    { name: "address", label: "Alamat / Sentra", type: "text" },
    { name: "description", label: "Deskripsi", type: "textarea", required: true },
    { name: "isHalal", label: "Halal", type: "checkbox" },
    { name: "imageUrl", label: "Foto Kuliner", type: "image", scope: "kuliner" },
    statusField,
  ];
  const toForm = (r: CulinaryRow): FormValues => ({
    name: r.name,
    categoryId: r.categoryId,
    district: r.district,
    priceRange: r.priceRange,
    address: r.address,
    description: r.description,
    isHalal: r.isHalal,
    imageUrl: r.imageUrl,
    status: r.status,
  });
  return (
    <EntityManager
      badge="Manajemen Konten"
      title="Kuliner & Oleh-Oleh Khas"
      subtitle="Kelola daftar makanan legendaris, rentang harga, dan titik sentra kuliner Purbalingga."
      addLabel="Tambah Menu Kuliner"
      entityLabel="kuliner"
      searchPlaceholder="Cari kuliner atau kecamatan..."
      rows={rows}
      fields={fields}
      emptyForm={{ name: "", categoryId: categories[0]?.id ?? "", district: "", priceRange: "", address: "", description: "", isHalal: true, imageUrl: "", status: "PUBLISHED" }}
      toForm={toForm}
      searchText={(r) => `${r.name} ${r.district}`}
      rowName={(r) => r.name}
      create={createCulinaryAction}
      update={updateCulinaryAction}
      remove={deleteCulinaryAction}
      columns={[
        { header: "Nama Kuliner", render: (r) => <span className="font-heading font-semibold text-stone-900">{r.name}</span> },
        { header: "Kategori", render: (r) => <Badge variant="primary" className="text-[10px]">{r.categoryName}</Badge> },
        { header: "Kecamatan", render: (r) => r.district },
        { header: "Kisaran Harga", render: (r) => <span className="font-bold text-primary-800">{r.priceRange || "-"}</span> },
        { header: "Halal", render: (r) => (r.isHalal ? "Halal" : "—") },
        { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  );
}

/* ------------------------------- Event ------------------------------ */

type EventRow = Awaited<ReturnType<typeof getEventsForAdmin>>[number];

export function EventManager({ rows, categories }: { rows: EventRow[]; categories: Cat }) {
  const fields: FieldDef[] = [
    { name: "title", label: "Nama Event", type: "text", required: true, full: true },
    { name: "categoryId", label: "Kategori", type: "select", options: catOptions(categories) },
    { name: "location", label: "Lokasi", type: "text", required: true },
    { name: "startDate", label: "Mulai (WIB)", type: "datetime-local", required: true },
    { name: "endDate", label: "Selesai (WIB)", type: "datetime-local" },
    { name: "organizer", label: "Penyelenggara", type: "text" },
    { name: "bannerUrl", label: "Banner Event", type: "image", scope: "event" },
    statusField,
    { name: "description", label: "Deskripsi", type: "textarea", required: true },
  ];
  const toForm = (r: EventRow): FormValues => ({
    title: r.title,
    categoryId: r.categoryId,
    location: r.location,
    startDate: r.startDate,
    endDate: r.endDate,
    organizer: r.organizer,
    bannerUrl: r.bannerUrl,
    status: r.status,
    description: r.description,
  });
  return (
    <EntityManager
      badge="Manajemen Konten"
      title="Event & Kalender Budaya"
      subtitle="Kelola agenda festival, tradisi, dan kegiatan budaya di Purbalingga."
      addLabel="Tambah Event Baru"
      entityLabel="event"
      searchPlaceholder="Cari event atau lokasi..."
      rows={rows}
      fields={fields}
      emptyForm={{ title: "", categoryId: categories[0]?.id ?? "", location: "", startDate: "", endDate: "", organizer: "", bannerUrl: "", status: "PUBLISHED", description: "" }}
      toForm={toForm}
      searchText={(r) => `${r.title} ${r.location}`}
      rowName={(r) => r.title}
      create={createEventAction}
      update={updateEventAction}
      remove={deleteEventAction}
      columns={[
        { header: "Nama Event", render: (r) => <span className="font-heading font-semibold text-stone-900">{r.title}</span> },
        { header: "Tanggal", render: (r) => r.dateLabel },
        { header: "Lokasi", render: (r) => r.location },
        { header: "Kategori", render: (r) => <Badge variant="primary" className="text-[10px]">{r.categoryName}</Badge> },
        { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  );
}

/* -------------------------------- UMKM ------------------------------ */

type BusinessRow = Awaited<ReturnType<typeof getBusinessesForAdmin>>[number];

export function BusinessManager({ rows, categories }: { rows: BusinessRow[]; categories: Cat }) {
  const fields: FieldDef[] = [
    { name: "name", label: "Nama UMKM / Sentra", type: "text", required: true, full: true },
    { name: "categoryId", label: "Kategori", type: "select", options: catOptions(categories) },
    districtField,
    { name: "ownerName", label: "Nama Pemilik", type: "text" },
    { name: "whatsappNumber", label: "WhatsApp", type: "text", placeholder: "08xxxxxxxxxx" },
    { name: "address", label: "Alamat", type: "text", full: true },
    { name: "features", label: "Keunggulan (pisahkan dengan koma)", type: "text", full: true, placeholder: "Handmade, Pasar Ekspor, Bahan Alami" },
    { name: "description", label: "Deskripsi", type: "textarea", required: true },
    { name: "logoUrl", label: "Foto / Logo UMKM", type: "image", scope: "umkm" },
    statusField,
  ];
  const toForm = (r: BusinessRow): FormValues => ({
    name: r.name,
    categoryId: r.categoryId,
    district: r.district,
    ownerName: r.ownerName,
    whatsappNumber: r.whatsappNumber,
    address: r.address,
    features: r.features,
    logoUrl: r.logoUrl,
    description: r.description,
    status: r.status,
  });
  return (
    <EntityManager
      badge="Manajemen Konten"
      title="UMKM & Produk Unggulan"
      subtitle="Kelola pelaku usaha dan produk unggulan daerah Purbalingga."
      addLabel="Tambah UMKM Baru"
      entityLabel="UMKM"
      searchPlaceholder="Cari UMKM atau kecamatan..."
      rows={rows}
      fields={fields}
      emptyForm={{ name: "", categoryId: categories[0]?.id ?? "", district: "", ownerName: "", whatsappNumber: "", address: "", features: "", logoUrl: "", description: "", status: "PUBLISHED" }}
      toForm={toForm}
      searchText={(r) => `${r.name} ${r.district}`}
      rowName={(r) => r.name}
      create={createBusinessAction}
      update={updateBusinessAction}
      remove={deleteBusinessAction}
      columns={[
        { header: "Nama UMKM", render: (r) => <span className="font-heading font-semibold text-stone-900">{r.name}</span> },
        { header: "Kategori", render: (r) => <Badge variant="primary" className="text-[10px]">{r.categoryName}</Badge> },
        { header: "Kecamatan", render: (r) => r.district },
        { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  );
}

/* ------------------------------- Berita ----------------------------- */

type ArticleRow = Awaited<ReturnType<typeof getArticlesForAdmin>>[number];

export function ArticleManager({ rows, categories }: { rows: ArticleRow[]; categories: Cat }) {
  const fields: FieldDef[] = [
    { name: "title", label: "Judul Berita", type: "text", required: true, full: true },
    { name: "categoryId", label: "Kategori", type: "select", options: catOptions(categories) },
    { ...statusField, options: STATUS_OPTIONS },
    { name: "excerpt", label: "Ringkasan", type: "textarea", required: true, rows: 2 },
    { name: "content", label: "Isi Berita", type: "textarea", required: true, rows: 8 },
    { name: "coverImageUrl", label: "Foto Sampul", type: "image", scope: "berita" },
  ];
  const toForm = (r: ArticleRow): FormValues => ({
    title: r.title,
    categoryId: r.categoryId,
    status: r.status,
    excerpt: r.excerpt,
    content: r.content,
    coverImageUrl: r.coverImageUrl,
  });
  return (
    <EntityManager
      badge="Manajemen Konten"
      title="Berita & Artikel"
      subtitle="Tulis, terbitkan, dan arsipkan warta daerah serta informasi pariwisata."
      addLabel="Tulis Berita Baru"
      entityLabel="berita"
      searchPlaceholder="Cari judul berita..."
      rows={rows}
      fields={fields}
      emptyForm={{ title: "", categoryId: categories[0]?.id ?? "", status: "DRAFT", excerpt: "", content: "", coverImageUrl: "" }}
      toForm={toForm}
      searchText={(r) => r.title}
      rowName={(r) => r.title}
      create={createArticleAction}
      update={updateArticleAction}
      remove={deleteArticleAction}
      columns={[
        { header: "Judul", render: (r) => <span className="font-heading font-semibold text-stone-900 line-clamp-1">{r.title}</span> },
        { header: "Kategori", render: (r) => <Badge variant="primary" className="text-[10px]">{r.categoryName}</Badge> },
        { header: "Tanggal", render: (r) => r.dateLabel },
        { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  );
}
