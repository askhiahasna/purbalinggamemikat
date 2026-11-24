// Seed data DUMMY untuk pengembangan. Jalankan: npm run db:seed
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DESTINATIONS_DATA } from "./seed-data/destinations";
import { DEFAULT_SETTINGS } from "../src/lib/data/cms-store";
import { slugify } from "../src/lib/utils";
import content from "./seed-data/content.json";

const prisma = new PrismaClient();

const MONTHS: Record<string, number> = {
  januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
  juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
};

function parseIdDate(text: string): Date {
  const [d, m, y] = text.trim().split(/\s+/);
  const month = MONTHS[m.toLowerCase()];
  if (month === undefined) return new Date();
  return new Date(Date.UTC(Number(y), month, Number(d)));
}

async function main() {
  // 1. Kategori destinasi
  const catMap = new Map<string, string>();
  const cats = new Map(DESTINATIONS_DATA.map((d) => [d.category, d.categoryLabel]));
  let order = 0;
  for (const [slug, name] of cats) {
    const c = await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { slug, name, type: "DESTINATION", sortOrder: order++ },
    });
    catMap.set(slug, c.id);
  }

  // 2. Destinasi + fasilitas + ulasan
  for (const d of DESTINATIONS_DATA) {
    const data = {
      name: d.name,
      summary: d.summary,
      description: d.description,
      categoryId: catMap.get(d.category)!,
      district: d.district,
      address: d.address,
      latitude: d.latitude,
      longitude: d.longitude,
      ticketPriceWeekday: d.ticketWeekday,
      ticketPriceWeekend: d.ticketWeekend,
      openingHours: d.openingHours,
      bestVisitingTime: d.bestVisitingTime,
      accessibilityNotes: d.accessibility,
      contactPhone: d.contactPhone,
      contactManagerName: d.contactManager,
      coverGradient: d.coverGradient,
      accentColor: d.accentColor,
      isFeatured: true,
      status: "PUBLISHED" as const,
    };
    const dest = await prisma.destination.upsert({
      where: { slug: d.slug },
      update: data,
      create: { slug: d.slug, ...data },
    });

    await prisma.destinationFacility.deleteMany({ where: { destinationId: dest.id } });
    for (const f of d.facilities) {
      const fac = await prisma.facility.upsert({
        where: { name: f },
        update: {},
        create: { name: f },
      });
      await prisma.destinationFacility.create({
        data: { destinationId: dest.id, facilityId: fac.id },
      });
    }

    await prisma.review.deleteMany({ where: { destinationId: dest.id, authorEmail: "seed@example.invalid" } });
    for (const r of d.reviews) {
      const at = parseIdDate(r.date);
      await prisma.review.create({
        data: {
          destinationId: dest.id,
          authorName: r.author,
          authorEmail: "seed@example.invalid",
          rating: r.rating,
          comment: r.comment,
          isApproved: true,
          approvedAt: at,
          createdAt: at,
        },
      });
    }
  }

  // 2b. Kuliner, event, UMKM, berita
  const ensureCategory = async (type: "CULINARY" | "EVENT" | "UMKM" | "ARTICLE", prefix: string, name: string, slug?: string) => {
    const full = `${prefix}-${slug ?? slugify(name)}`;
    const c = await prisma.category.upsert({
      where: { slug: full },
      update: { name },
      create: { slug: full, name, type },
    });
    return c.id;
  };

  const CULINARY_CATS: Record<string, string> = {
    "makanan-berat": "Makanan Berat",
    cemilan: "Cemilan & Jajanan",
    minuman: "Minuman",
    "oleh-oleh": "Oleh-Oleh",
  };
  for (const k of content.kuliner) {
    const categoryId = await ensureCategory("CULINARY", "kuliner", CULINARY_CATS[k.category], k.category);
    const data = {
      name: k.name,
      description: k.desc,
      priceRange: k.priceRange,
      district: k.district,
      address: `Kec. ${k.district}, Kabupaten Purbalingga`,
      isHalal: k.isHalal,
      categoryId,
    };
    await prisma.culinary.upsert({ where: { slug: k.id }, update: data, create: { slug: k.id, ...data } });
  }

  for (const e of content.events) {
    const categoryId = await ensureCategory("EVENT", "event", e.category);
    // "12 - 14 Juli 2026" | "25 Agustus 2026"
    const m = e.date.match(/^(\d+)(?:\s*-\s*(\d+))?\s+(\w+)\s+(\d{4})$/);
    const start = m ? parseIdDate(`${m[1]} ${m[3]} ${m[4]}`) : new Date();
    const end = m && m[2] ? parseIdDate(`${m[2]} ${m[3]} ${m[4]}`) : null;
    const data = {
      title: e.title,
      description: e.desc,
      location: e.location,
      startDate: start,
      endDate: end,
      categoryId,
    };
    await prisma.event.upsert({ where: { slug: slugify(e.title) }, update: data, create: { slug: slugify(e.title), ...data } });
  }

  for (const u of content.umkm) {
    const categoryId = await ensureCategory("UMKM", "umkm", u.tag);
    const data = {
      name: u.name,
      description: u.desc,
      district: u.district,
      address: `Kec. ${u.district}, Kabupaten Purbalingga`,
      features: u.features,
      categoryId,
    };
    await prisma.business.upsert({ where: { slug: u.id }, update: data, create: { slug: u.id, ...data } });
  }

  // Penulis default artikel: user redaksi nonaktif (tanpa kredensial login yang valid)
  const redaksi = await prisma.user.upsert({
    where: { email: "redaksi@purbalingga-memikat.invalid" },
    update: {},
    create: {
      email: "redaksi@purbalingga-memikat.invalid",
      name: "Redaksi Purbalingga Memikat",
      role: "EDITOR",
      isActive: false,
      passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
    },
  });
  for (const a of content.berita) {
    const categoryId = await ensureCategory("ARTICLE", "berita", a.category);
    const at = parseIdDate(a.date);
    const data = {
      title: a.title,
      excerpt: a.desc,
      content: a.desc,
      status: "PUBLISHED" as const,
      publishedAt: at,
      authorId: redaksi.id,
      categoryId,
    };
    await prisma.article.upsert({ where: { slug: slugify(a.title) }, update: data, create: { slug: slugify(a.title), ...data } });
  }

  // 3. Pengaturan situs
  await prisma.siteSetting.upsert({
    where: { key: "site" },
    update: {},
    create: { key: "site", value: DEFAULT_SETTINGS as object },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
