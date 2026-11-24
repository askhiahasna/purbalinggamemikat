export type Role = "SUPER_ADMIN" | "EDITOR" | "DESTINATION_MANAGER";

export type PublishStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface DestinationItem {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  district: string;
  address: string;
  ticketPriceWeekday?: number;
  ticketPriceWeekend?: number;
  openingHours?: string;
  coverImage?: string;
  isFeatured: boolean;
  status: PublishStatus;
}

export interface CulinaryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceRange?: string;
  district: string;
  address: string;
  isHalal: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  startDate: string;
  endDate?: string;
}
