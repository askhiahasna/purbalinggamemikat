export interface DestinationReview {
  id: string;
  author: string;
  date: string;
  rating: number;
  comment: string;
}

export interface DestinationPhoto {
  id: string;
  url: string;
  caption: string;
  isCover: boolean;
}

export interface DestinationDetail {
  id: string;
  slug: string;
  name: string;
  category: "wisata-alam" | "wisata-air" | "desa-wisata" | "sejarah-budaya" | "taman-rekreasi";
  categoryLabel: string;
  district: string;
  address: string;
  summary: string;
  description: string;
  ticketWeekday: number;
  ticketWeekend: number;
  openingHours: string;
  bestVisitingTime: string;
  accessibility: string;
  contactPhone: string;
  contactManager: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  facilities: string[];
  isFeatured: boolean;
  coverGradient: string;
  accentColor: string;
  reviews: DestinationReview[];
  /** Galeri terurut; kosong -> UI memakai coverGradient sebagai placeholder. */
  images: DestinationPhoto[];
  coverUrl: string | null;
}
