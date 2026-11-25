import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/server/queries/content";

type StatusCounts = { PUBLISHED: number; DRAFT: number; ARCHIVED: number; total: number };

function toCounts(rows: { status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; _count: { _all: number } }[]): StatusCounts {
  const c: StatusCounts = { PUBLISHED: 0, DRAFT: 0, ARCHIVED: 0, total: 0 };
  for (const r of rows) {
    c[r.status] = r._count._all;
    c.total += r._count._all;
  }
  return c;
}

const rel = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });
export function timeAgo(d: Date, now = new Date()) {
  const s = Math.round((d.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(s);
  if (abs < 60) return "baru saja";
  if (abs < 3600) return rel.format(Math.round(s / 60), "minute");
  if (abs < 86400) return rel.format(Math.round(s / 3600), "hour");
  if (abs < 86400 * 30) return rel.format(Math.round(s / 86400), "day");
  return rel.format(Math.round(s / (86400 * 30)), "month");
}

/* ----------------------- SUPER_ADMIN & EDITOR ----------------------- */

export async function getStaffDashboard(opts: { includeUsers: boolean }) {
  const now = new Date();
  const [
    dest, culinary, event, business, article, accommodation,
    upcomingEvents, pendingReviews, pendingSubs, pendingByType,
    noPhoto, umkmDrafts, recentSubs, reviewQueue, nextEvents, userRoles,
  ] = await Promise.all([
    prisma.destination.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.culinary.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.event.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.business.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.article.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.accommodation.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.event.count({ where: { status: "PUBLISHED", OR: [{ startDate: { gte: now } }, { endDate: { gte: now } }] } }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.publicSubmission.count({ where: { status: "PENDING" } }),
    prisma.publicSubmission.groupBy({ by: ["type"], where: { status: "PENDING" }, _count: { _all: true } }),
    prisma.destination.count({ where: { status: "PUBLISHED", images: { none: {} } } }),
    prisma.business.count({ where: { status: "DRAFT" } }),
    prisma.publicSubmission.findMany({
      where: { status: { not: "RESOLVED" } },
      orderBy: [{ createdAt: "desc" }],
      take: 5,
      select: { id: true, type: true, status: true, senderName: true, subject: true, createdAt: true },
    }),
    prisma.review.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, authorName: true, rating: true, comment: true, createdAt: true, destination: { select: { name: true } } },
    }),
    prisma.event.findMany({
      where: { status: "PUBLISHED", OR: [{ startDate: { gte: now } }, { endDate: { gte: now } }] },
      orderBy: { startDate: "asc" },
      take: 3,
      select: { id: true, title: true, location: true, startDate: true, endDate: true },
    }),
    opts.includeUsers
      ? prisma.user.groupBy({ by: ["role"], where: { isActive: true }, _count: { _all: true } })
      : Promise.resolve(null),
  ]);

  const byType: Record<string, number> = {};
  for (const t of pendingByType) byType[t.type] = t._count._all;

  return {
    destinations: toCounts(dest),
    culinary: toCounts(culinary),
    events: { ...toCounts(event), upcoming: upcomingEvents },
    businesses: toCounts(business),
    articles: toCounts(article),
    accommodations: toCounts(accommodation),
    pendingReviews,
    pendingSubs,
    pendingByType: byType,
    destinationsWithoutPhoto: noPhoto,
    umkmDrafts,
    recentSubs: recentSubs.map((s) => ({ ...s, ago: timeAgo(s.createdAt) })),
    reviewQueue: reviewQueue.map((r) => ({
      id: r.id,
      author: r.authorName,
      rating: r.rating,
      comment: r.comment,
      destination: r.destination.name,
      ago: timeAgo(r.createdAt),
    })),
    nextEvents: nextEvents.map((e) => ({
      id: e.id,
      title: e.title,
      location: e.location,
      date: formatDateRange(e.startDate, e.endDate),
    })),
    users: userRoles
      ? {
          total: userRoles.reduce((a, r) => a + r._count._all, 0),
          byRole: Object.fromEntries(userRoles.map((r) => [r.role, r._count._all])) as Record<string, number>,
        }
      : null,
  };
}

/* ------------------------- DESTINATION_MANAGER ------------------------ */

export async function getManagerDashboard(userId: string) {
  const rows = await prisma.destination.findMany({
    where: { managerId: userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      district: true,
      status: true,
      _count: { select: { images: true } },
      reviews: { where: { isApproved: true }, select: { rating: true } },
    },
  });
  return rows.map((d) => {
    const n = d.reviews.length;
    const avg = n ? d.reviews.reduce((a, r) => a + r.rating, 0) / n : 0;
    return {
      id: d.id,
      name: d.name,
      district: d.district,
      status: d.status,
      photos: d._count.images,
      reviewCount: n,
      rating: Math.round(avg * 10) / 10,
    };
  });
}
