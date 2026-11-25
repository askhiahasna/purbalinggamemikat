import { prisma } from "@/lib/prisma";
import { PURBALINGGA_DISTRICTS } from "@/lib/constants";

export interface HomeStat {
  value: number;
  label: string;
  subtext: string;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();

/**
 * Statistik beranda dari database (hanya konten berstatus PUBLISHED).
 * - Kecamatan = jumlah kecamatan (dari 18) yang memiliki minimal satu destinasi/kuliner/UMKM terbit.
 * - Desa Wisata & Penginapan = destinasi terbit berkategori "desa-wisata" + akomodasi terbit.
 */
export async function getHomeStats(): Promise<HomeStat[]> {
  const published = { status: "PUBLISHED" as const };
  const [destinations, culinary, businesses, desaWisata, categories, dDistricts, cDistricts, bDistricts, accommodations, aDistricts] = await Promise.all([
    prisma.destination.count({ where: published }),
    prisma.culinary.count({ where: published }),
    prisma.business.count({ where: published }),
    prisma.destination.count({ where: { ...published, category: { slug: "desa-wisata" } } }),
    prisma.destination.findMany({ where: published, select: { category: { select: { name: true } } }, distinct: ["categoryId"] }),
    prisma.destination.findMany({ where: published, select: { district: true } }),
    prisma.culinary.findMany({ where: published, select: { district: true } }),
    prisma.business.findMany({ where: published, select: { district: true } }),
    prisma.accommodation.count({ where: published }),
    prisma.accommodation.findMany({ where: published, select: { district: true } }),
  ]);

  const texts = [...dDistricts, ...cDistricts, ...bDistricts, ...aDistricts].map((r) => norm(r.district));
  const covered = PURBALINGGA_DISTRICTS.filter((k) => {
    const n = norm(k);
    return texts.some((t) => new RegExp(`(^| )${n}( |$)`).test(t));
  }).length;

  const catNames = categories.map((c) => c.category.name);
  const catText = catNames.length
    ? catNames.slice(0, 3).join(", ") + (catNames.length > 3 ? ` +${catNames.length - 3} kategori` : "")
    : "Belum ada destinasi terbit";

  return [
    { value: destinations, label: "Destinasi Wisata", subtext: catText },
    { value: covered, label: "Kecamatan Terjangkau", subtext: `dari ${PURBALINGGA_DISTRICTS.length} kecamatan memiliki konten` },
    { value: culinary + businesses, label: "Kuliner & UMKM", subtext: `${culinary} kuliner • ${businesses} UMKM` },
    { value: desaWisata + accommodations, label: "Desa Wisata & Penginapan", subtext: `${desaWisata} desa wisata • ${accommodations} penginapan` },
  ];
}
