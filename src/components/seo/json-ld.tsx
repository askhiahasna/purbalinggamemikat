import { jsonLdString } from "@/lib/seo";

/** Menyisipkan data terstruktur schema.org (JSON-LD). Dirender di server. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
