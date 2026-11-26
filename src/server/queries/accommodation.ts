import { cached } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { ACCOMMODATION_TYPE_LABEL } from "@/lib/validation/content";

async function getPublishedAccommodationsUncached() {
  const rows = await prisma.accommodation.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ name: "asc" }] });
  return rows.map((r) => ({
    id: r.slug,
    slug: r.slug,
    name: r.name,
    type: r.type,
    typeLabel: ACCOMMODATION_TYPE_LABEL[r.type],
    district: r.district,
    address: r.address,
    description: r.description,
    priceFrom: r.priceFrom,
    priceTo: r.priceTo,
    phone: r.phone,
    whatsappNumber: r.whatsappNumber,
    websiteUrl: r.websiteUrl,
    facilities: r.facilities,
    imageUrl: r.imageUrl,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export type PublicAccommodation = Awaited<ReturnType<typeof getPublishedAccommodations>>[number];

export async function getAccommodationsForAdmin() {
  const rows = await prisma.accommodation.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    type: r.type,
    typeLabel: ACCOMMODATION_TYPE_LABEL[r.type],
    description: r.description,
    district: r.district,
    address: r.address,
    latitude: r.latitude === null ? "" : String(r.latitude),
    longitude: r.longitude === null ? "" : String(r.longitude),
    priceFrom: r.priceFrom === null ? "" : String(r.priceFrom),
    priceTo: r.priceTo === null ? "" : String(r.priceTo),
    phone: r.phone ?? "",
    whatsappNumber: r.whatsappNumber ?? "",
    websiteUrl: r.websiteUrl ?? "",
    facilities: r.facilities.join(", "),
    imageUrl: r.imageUrl ?? "",
    status: r.status,
  }));
}

export const getPublishedAccommodations = cached(getPublishedAccommodationsUncached, "getPublishedAccommodations");
