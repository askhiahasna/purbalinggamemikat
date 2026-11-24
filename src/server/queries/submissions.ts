import { prisma } from "@/lib/prisma";

const fmt = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

export async function getSubmissionsForAdmin() {
  const rows = await prisma.publicSubmission.findMany({
    orderBy: [{ createdAt: "desc" }],
    take: 500,
    include: { handledBy: { select: { name: true } } },
  });
  return rows.map((r) => {
    const payload = (r.payload && typeof r.payload === "object" && !Array.isArray(r.payload) ? r.payload : {}) as Record<string, unknown>;
    return {
      id: r.id,
      type: r.type,
      status: r.status,
      senderName: r.senderName,
      senderEmail: r.senderEmail,
      senderPhone: r.senderPhone ?? "",
      subject: r.subject,
      message: r.message,
      rating: r.rating,
      notes: r.notes ?? "",
      createdAt: fmt.format(r.createdAt),
      handledBy: r.handledBy?.name ?? "",
      businessKind: typeof payload.kind === "string" ? payload.kind : "",
      businessName: typeof payload.businessName === "string" ? payload.businessName : "",
      district: typeof payload.district === "string" ? payload.district : "",
      address: typeof payload.address === "string" ? payload.address : "",
      businessCreated: typeof payload.businessId === "string",
    };
  });
}

export async function getSurveySummary() {
  const [agg, groups] = await Promise.all([
    prisma.publicSubmission.aggregate({ where: { type: "SURVEY", rating: { not: null } }, _avg: { rating: true }, _count: { rating: true } }),
    prisma.publicSubmission.groupBy({ by: ["rating"], where: { type: "SURVEY", rating: { not: null } }, _count: { _all: true } }),
  ]);
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const g of groups) if (g.rating) dist[g.rating] = g._count._all;
  return { count: agg._count.rating, average: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0, dist };
}

/** Jumlah pesan belum ditangani (badge sidebar). */
export async function countPendingSubmissions() {
  return prisma.publicSubmission.count({ where: { status: "PENDING" } });
}
