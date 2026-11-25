import {
  Utensils,
  Cookie,
  Coffee,
  ShoppingBasket,
  Mountain,
  Waves,
  Home,
  Landmark,
  TreePine,
  BedDouble,
  Hotel,
  Tent,
  Building2,
  Calendar,
  Music,
  Newspaper,
  ShoppingBag,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const RULES: [RegExp, LucideIcon][] = [
  [/makan|berat|resto|warung/, Utensils],
  [/cemil|jajan|snack|kue/, Cookie],
  [/minum|kopi|es\b|teh|jus/, Coffee],
  [/oleh|souvenir|buah tangan/, ShoppingBasket],
  [/alam|gunung|bukit|goa|gua/, Mountain],
  [/air|curug|sungai|waterpark|renang/, Waves],
  [/desa|homestay/, Home],
  [/sejarah|budaya|museum|monumen|religi/, Landmark],
  [/taman|rekreasi|edukasi/, TreePine],
  [/hotel/, Hotel],
  [/villa|guest|penginapan/, BedDouble],
  [/camp/, Tent],
  [/seni|musik|pertunjukan|festival/, Music],
  [/acara|event|tradisi/, Calendar],
  [/umkm|produk|kerajinan|usaha|ekspor|manufaktur|wastra|pangan/, ShoppingBag],
  [/berita|warta|pariwisata|artikel/, Newspaper],
  [/ekonomi|bisnis/, Building2],
];

/** Pilih ikon tile dari kata kunci pada nama kategori (fallback bila tak cocok). */
export function tileIcon(label: string, fallback: LucideIcon = Sparkles): LucideIcon {
  const k = label.toLowerCase();
  return RULES.find(([re]) => re.test(k))?.[1] ?? fallback;
}

/** Calon gambar hero berurutan: yang pertama terisi dipakai (null -> gradient). */
export const pickHero = (...candidates: (string | null | undefined)[]): string | null => candidates.find((c): c is string => !!c) ?? null;
