import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";

// Diambil dari database saat diminta (bukan saat build).
export const dynamic = "force-dynamic";

const STATIC: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/destinasi", priority: 0.9, changeFrequency: "weekly" },
  { path: "/kuliner", priority: 0.7, changeFrequency: "weekly" },
  { path: "/budaya-event", priority: 0.7, changeFrequency: "weekly" },
  { path: "/umkm", priority: 0.6, changeFrequency: "weekly" },
  { path: "/berita", priority: 0.7, changeFrequency: "daily" },
  { path: "/profil", priority: 0.5, changeFrequency: "monthly" },
  { path: "/layanan", priority: 0.5, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC.map((s) => ({
    url: absoluteUrl(s.path),
    lastModified: new Date(),
    changeFrequency: s.changeFrequency,
    priority: s.priority,
  }));

  try {
    const [destinations, articles] = await Promise.all([
      prisma.destination.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
      prisma.article.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true, publishedAt: true } }),
    ]);
    for (const d of destinations) {
      entries.push({ url: absoluteUrl(`/destinasi/${d.slug}`), lastModified: d.updatedAt, changeFrequency: "weekly", priority: 0.8 });
    }
    for (const a of articles) {
      entries.push({ url: absoluteUrl(`/berita/${a.slug}`), lastModified: a.updatedAt, changeFrequency: "monthly", priority: 0.6 });
    }
  } catch (e) {
    console.error("sitemap: gagal membaca database, hanya halaman statis", e);
  }
  return entries;
}
