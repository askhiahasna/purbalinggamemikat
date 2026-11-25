/**
 * Daftar resmi 18 Kecamatan di Kabupaten Purbalingga
 */
export const PURBALINGGA_DISTRICTS = [
  "Bobotsari",
  "Bojongsari",
  "Bukateja",
  "Kaligondang",
  "Kalimanah",
  "Karanganyar",
  "Karangjambe",
  "Karangmoncol",
  "Karangreja",
  "Kejobong",
  "Kemangkon",
  "Kertanegara",
  "Kutasari",
  "Mrebet",
  "Padamara",
  "Pengadegan",
  "Purbalingga",
  "Rembang",
] as const;

export type PurbalinggaDistrict = (typeof PURBALINGGA_DISTRICTS)[number];

/**
 * Kategori Pariwisata & Potensi Daerah
 */
export const TOURISM_CATEGORIES = [
  { slug: "wisata-alam", name: "Wisata Alam", icon: "Mountain" },
  { slug: "wisata-air", name: "Wisata Air & Curug", icon: "Waves" },
  { slug: "desa-wisata", name: "Desa Wisata", icon: "Home" },
  { slug: "sejarah-budaya", name: "Sejarah & Budaya", icon: "Landmark" },
  { slug: "taman-rekreasi", name: "Taman Rekreasi", icon: "TreePine" },
] as const;

/**
 * Navigasi Menu Publik
 */
export const PUBLIC_NAV_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Destinasi", href: "/destinasi" },
  { label: "Akomodasi", href: "/akomodasi" },
  { label: "Peta", href: "/peta" },
  { label: "Kuliner", href: "/kuliner" },
  { label: "Budaya & Event", href: "/budaya-event" },
  { label: "Profil Daerah", href: "/profil" },
  { label: "UMKM", href: "/umkm" },
  { label: "Layanan & Kontak", href: "/layanan" },
] as const;

/**
 * Navigasi Menu Admin CMS
 */
export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Pengaturan & Tampilan", href: "/admin/pengaturan", icon: "Settings" },
  { label: "Destinasi Wisata", href: "/admin/destinasi", icon: "MapPin" },
  { label: "Kuliner & Oleh-oleh", href: "/admin/kuliner", icon: "Utensils" },
  { label: "Kalender Event", href: "/admin/event", icon: "Calendar" },
  { label: "UMKM & Produk", href: "/admin/umkm", icon: "ShoppingBag" },
  { label: "Akomodasi", href: "/admin/akomodasi", icon: "BedDouble" },
  { label: "Berita & Warta", href: "/admin/berita", icon: "Newspaper" },
  { label: "Aspirasi & Ulasan", href: "/admin/moderasi", icon: "MessageSquare" },
  { label: "Layanan Publik", href: "/admin/layanan", icon: "Inbox" },
  { label: "Impor & Ekspor Data", href: "/admin/data", icon: "FileSpreadsheet" },
  { label: "Manajemen Pengguna", href: "/admin/pengguna", icon: "Users" },
] as const;
