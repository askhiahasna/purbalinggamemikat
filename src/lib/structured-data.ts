import { absoluteUrl, SITE_NAME, siteUrl, truncate } from "@/lib/seo";
import { priceRangeLabel } from "@/lib/contact";
import type { PublicAccommodation } from "@/server/queries/accommodation";
import type { PublicCulinary } from "@/server/queries/content";
import type { DestinationDetail } from "@/types/destination";

// Pembangun JSON-LD schema.org. Hanya memakai data yang benar-benar ada di database
// (tidak ada nilai karangan); properti tanpa data dihilangkan.

const ctx = "https://schema.org";

export function websiteLd(logoUrl?: string) {
  const logo = logoUrl && /^https?:\/\//.test(logoUrl) ? logoUrl : undefined;
  return [
    { "@context": ctx, "@type": "WebSite", name: SITE_NAME, url: siteUrl(), inLanguage: "id-ID" },
    {
      "@context": ctx,
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl(),
      ...(logo ? { logo } : {}),
    },
  ];
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": ctx,
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function itemListLd(name: string, items: { name: string; path?: string; image?: string | null; description?: string }[]) {
  return {
    "@context": ctx,
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      ...(it.path ? { url: absoluteUrl(it.path) } : {}),
      name: it.name,
      ...(it.image ? { image: it.image } : {}),
      ...(it.description ? { description: truncate(it.description, 200) } : {}),
    })),
  };
}

export function destinationLd(d: DestinationDetail) {
  const hasGeo = d.latitude !== 0 || d.longitude !== 0;
  const free = d.ticketWeekday === 0 && d.ticketWeekend === 0;
  const images = d.images.map((i) => i.url);
  return {
    "@context": ctx,
    "@type": "TouristAttraction",
    name: d.name,
    description: truncate(d.summary || d.description, 300),
    url: absoluteUrl(`/destinasi/${d.slug}`),
    ...(images.length ? { image: images } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: d.address,
      addressLocality: d.district,
      addressRegion: "Jawa Tengah",
      addressCountry: "ID",
    },
    ...(hasGeo ? { geo: { "@type": "GeoCoordinates", latitude: d.latitude, longitude: d.longitude } } : {}),
    ...(d.contactPhone && d.contactPhone !== "-" ? { telephone: d.contactPhone } : {}),
    isAccessibleForFree: free,
    publicAccess: true,
    ...(!free && d.ticketWeekday > 0
      ? { offers: { "@type": "Offer", price: d.ticketWeekday, priceCurrency: "IDR", description: "Tiket masuk hari kerja" } }
      : {}),
    ...(d.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: d.rating,
            reviewCount: d.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
          review: d.reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
            reviewBody: truncate(r.comment, 300),
          })),
        }
      : {}),
  };
}

export function eventLd(e: {
  id: string;
  title: string;
  desc: string;
  location: string;
  startISO: string;
  endISO: string | null;
  imageUrl: string | null;
}) {
  return {
    "@context": ctx,
    "@type": "Event",
    name: e.title,
    description: truncate(e.desc, 300),
    startDate: e.startISO,
    ...(e.endISO ? { endDate: e.endISO } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: e.location,
      address: { "@type": "PostalAddress", addressRegion: "Jawa Tengah", addressCountry: "ID" },
    },
    ...(e.imageUrl ? { image: [e.imageUrl] } : {}),
    url: absoluteUrl("/budaya-event"),
  };
}

export function articleLd(a: {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedISO: string;
  modifiedISO: string;
}) {
  const url = absoluteUrl(`/berita/${a.slug}`);
  return {
    "@context": ctx,
    "@type": "NewsArticle",
    headline: truncate(a.title, 110),
    description: truncate(a.excerpt, 200),
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: a.publishedISO,
    dateModified: a.modifiedISO,
    ...(a.coverImageUrl ? { image: [a.coverImageUrl] } : {}),
    // Nama staf tidak dipublikasikan; penulis ditampilkan sebagai redaksi.
    author: { "@type": "Organization", name: `Redaksi ${SITE_NAME}` },
    publisher: { "@type": "Organization", name: SITE_NAME, url: siteUrl() },
    inLanguage: "id-ID",
  };
}

export function accommodationLd(a: PublicAccommodation) {
  const range = priceRangeLabel(a.priceFrom, a.priceTo);
  return {
    "@context": ctx,
    "@type": a.type === "HOTEL" ? "Hotel" : a.type === "CAMPING" ? "Campground" : "LodgingBusiness",
    name: a.name,
    description: truncate(a.description, 300),
    url: absoluteUrl("/akomodasi"),
    ...(a.imageUrl ? { image: [a.imageUrl] } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: a.address,
      addressLocality: a.district,
      addressRegion: "Jawa Tengah",
      addressCountry: "ID",
    },
    ...(a.latitude !== null && a.longitude !== null ? { geo: { "@type": "GeoCoordinates", latitude: a.latitude, longitude: a.longitude } } : {}),
    ...(a.phone ? { telephone: a.phone } : {}),
    ...(range ? { priceRange: range } : {}),
    ...(a.facilities.length
      ? { amenityFeature: a.facilities.map((f) => ({ "@type": "LocationFeatureSpecification", name: f, value: true })) }
      : {}),
  };
}

export function culinaryLd(c: PublicCulinary) {
  const hasGeo = typeof c.latitude === "number" && typeof c.longitude === "number" && !(c.latitude === 0 && c.longitude === 0);
  return {
    "@context": ctx,
    "@type": "FoodEstablishment",
    name: c.name,
    description: truncate(c.desc, 300),
    url: absoluteUrl(`/kuliner/${c.id}`),
    servesCuisine: c.categoryLabel,
    ...(c.imageUrl ? { image: [c.imageUrl] } : {}),
    ...(c.priceRange && c.priceRange !== "-" ? { priceRange: c.priceRange } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: c.address,
      addressLocality: c.district,
      addressRegion: "Jawa Tengah",
      addressCountry: "ID",
    },
    ...(hasGeo ? { geo: { "@type": "GeoCoordinates", latitude: c.latitude, longitude: c.longitude } } : {}),
  };
}
