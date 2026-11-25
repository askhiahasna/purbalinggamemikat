// Tipe & nilai default pengaturan situs. Persistensi ada di src/server/queries/settings.ts
export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  heroBadge: string;
  heroTitlePrefix: string;
  heroTitleMain: string;
  heroSubtitle: string;
  marqueeItems: string[];
  sekilasTitle: string;
  sekilasQuote: string;
  leader1Name: string;
  leader1Title: string;
  leader2Name: string;
  leader2Title: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  /** Foto beranda (URL Supabase Storage). Kosong = pakai fallback. */
  heroBgUrl: string;
  /** Satu foto gabungan Bupati & Wakil Bupati. */
  leadersPhotoUrl: string;
  statImage1Url: string;
  statImage2Url: string;
  statImage3Url: string;
  statImage4Url: string;
  /** Tautan media sosial (http/https). Kosong = tidak ditampilkan. */
  socialInstagram: string;
  socialFacebook: string;
  socialYoutube: string;
  socialTiktok: string;
  socialX: string;
  /** Foto hero tiap halaman menu (kosong = foto dari konten, lalu hero beranda). */
  heroPageKuliner: string;
  heroPageDestinasi: string;
  heroPageEvent: string;
  heroPageAkomodasi: string;
  heroPageUmkm: string;
  heroPageBerita: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Purbalingga Memikat",
  tagline: "Pesona di Setiap Langkah",
  logoUrl: "",
  heroBadge: "Bumi Perwira",
  heroTitlePrefix: "Welcome to",
  heroTitleMain: "Purbalingga",
  heroSubtitle:
    "Temukan keindahan alam lereng Gunung Slamet, kesegaran aliran Sungai Klawing, dan potensi lokal di setiap sudut Purbalingga.",
  marqueeItems: [
    "AYO DOLAN PURBALINGGA!",
    "BUMI PERWIRA",
    "PESONA ALAM LERENG GUNUNG SLAMET",
    "KULINER MENDOAN & SOTO KRIYIK",
    "FESTIVAL GUNUNG SLAMET & GREBEG ONJE",
    "WARISAN TRADISI BANYUMASAN",
  ],
  sekilasTitle: "Sekilas Purbalingga",
  sekilasQuote:
    "Mewujudkan Purbalingga yang Maju, Berdaya Saing, Sejahtera, dan Berkelanjutan.",
  leader1Name: "H. Fahmi Muhammad Hanif",
  leader1Title: "Bupati Purbalingga",
  leader2Name: "Dimas Prasetyahani, S.E., M.M.",
  leader2Title: "Wakil Bupati Purbalingga",
  contactPhone: "(0281) 891001",
  contactEmail: "info@purbalinggakab.go.id",
  contactAddress: "Jl. Jenderal Soedirman No. 1, Purbalingga, Jawa Tengah 53311",
  heroBgUrl: "",
  leadersPhotoUrl: "",
  statImage1Url: "",
  statImage2Url: "",
  statImage3Url: "",
  statImage4Url: "",
  socialInstagram: "",
  socialFacebook: "",
  socialYoutube: "",
  socialTiktok: "",
  socialX: "",
  heroPageKuliner: "",
  heroPageDestinasi: "",
  heroPageEvent: "",
  heroPageAkomodasi: "",
  heroPageUmkm: "",
  heroPageBerita: "",
};

/** Kunci lama yang sudah tidak dipakai (dibersihkan saat pengaturan disimpan). */
export const DEPRECATED_SETTING_KEYS = ["leader1PhotoUrl", "leader2PhotoUrl"] as const;
