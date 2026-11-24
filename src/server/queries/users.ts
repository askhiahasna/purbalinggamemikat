import { prisma } from "@/lib/prisma";

const fmt = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

export async function getUsersForAdmin() {
  const rows = await prisma.user.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      phone: true,
      lastLoginAt: true,
      destinations: { select: { id: true, name: true } },
      _count: { select: { articles: true } },
    },
  });
  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    phone: u.phone ?? "",
    lastLogin: u.lastLoginAt ? fmt.format(u.lastLoginAt) : "Belum pernah",
    destinationIds: u.destinations.map((d) => d.id).join(","),
    destinationNames: u.destinations.map((d) => d.name),
    articleCount: u._count.articles,
  }));
}

export async function getDestinationOptions() {
  return prisma.destination.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
