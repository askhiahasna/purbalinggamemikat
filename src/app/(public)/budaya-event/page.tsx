import { Calendar, MapPin, Sparkles, Music, Theater, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPublishedEvents } from "@/server/queries/content";
import { CardPhoto } from "@/components/ui/cover-image";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, eventLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import { SectionHero } from "@/components/public/section/section-hero";
import { RecommendationSection } from "@/components/public/section/recommendations";
import { pickHero, tileIcon } from "@/components/public/section/helpers";
import { getSiteSettings } from "@/server/queries/settings";
import { slugify } from "@/lib/utils";

// Konten berasal dari PostgreSQL (CMS) — dirender per-request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Kalender Event & Budaya Purbalingga",
  description:
    "Agenda festival, tradisi, dan pertunjukan seni budaya di Purbalingga: Festival Gunung Slamet, Grebeg Onje, Ebeg Banyumasan, dan acara lainnya.",
  path: "/budaya-event",
});

export default async function BudayaEventPage({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { kategori } = await searchParams;
  const [allEvents, settings] = await Promise.all([getPublishedEvents(), getSiteSettings()]);
  const events = kategori ? allEvents.filter((e) => slugify(e.category) === kategori) : allEvents;
  const cats = [...new Set(allEvents.map((e) => e.category))].slice(0, 4);
  const recommended = [...allEvents.filter((e) => e.imageUrl), ...allEvents.filter((e) => !e.imageUrl)].slice(0, 4);

  const arts = [
    {
      name: "Kesenian Ebeg (Kuda Lumping Banyumasan)",
      icon: Theater,
      desc: "Tarian keprajuritan tradisional yang diiringi gamelan berlaras slendro, melambangkan keberanian, ketangguhan, dan kearifan lokal.",
    },
    {
      name: "Musik Tradisional Calung Banyumasan",
      icon: Music,
      desc: "Alat musik perkusi bambu wulung khas Banyumas yang menghasilkan nada rancak, dinamis, dan riang penuh kebersahajaan.",
    },
    {
      name: "Tari Ujungan & Begalan Tradisi",
      icon: Sparkles,
      desc: "Tradisi adat permohonan hujan dan upacara perkawinan khas Banyumasan yang sarat petuah filosofis kehidupan berumah tangga.",
    },
    {
      name: "Wayang Kulit Gagrag Banyumasan",
      icon: Landmark,
      desc: "Seni pewayangan dengan penokohan punakawan Bawor yang blak-blakan (cablaka), jujur, lugas, dan setia kawan.",
    },
  ];

  return (
    <div>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Beranda", path: "/" },
            { name: "Budaya & Event", path: "/budaya-event" },
          ]),
          ...allEvents.map(eventLd),
        ]}
      />
      <SectionHero
        image={pickHero(settings.heroPageEvent, allEvents.find((e) => e.imageUrl)?.imageUrl, settings.heroBgUrl)}
        title={["Acara", "Purbalingga"]}
        subtitle="Festival, tradisi, dan pertunjukan seni budaya khas Banyumasan sepanjang tahun"
        tiles={cats.map((c) => ({ label: c, href: `/budaya-event?kategori=${slugify(c)}#katalog`, Icon: tileIcon(c, Calendar) }))}
      />
      <RecommendationSection
        id="rekomendasi"
        title="Agenda Acara Pilihan"
        items={recommended.map((e) => ({ id: e.id, name: e.title, image: e.imageUrl, href: `/budaya-event#${e.id}`, gradient: "from-primary-700 to-primary-900" }))}
      />


      {/* 2. KALENDER EVENT AGENDA */}
      <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-14 sm:py-20 scroll-mt-24">
        <div className="border-b border-stone-200 pb-4">
          <span className="text-xs uppercase tracking-widest text-secondary-600 font-bold block">
            Agenda Resmi 2026
          </span>
          <h2 className="font-editorial text-3xl font-bold text-primary-950 mt-1">
            Kalender Acara Tahunan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              id={ev.id}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-lg hover:border-secondary-500 transition-all space-y-4" data-reveal
            >
              <CardPhoto src={ev.imageUrl} alt={ev.title} />
              <div className="flex items-center justify-between">
                <Badge variant="primary" className="text-xs">
                  {ev.category}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-secondary-600 font-bold bg-secondary-50 px-3 py-1 rounded-full">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{ev.date}</span>
                </div>
              </div>

              <h3 className="font-editorial text-2xl font-bold text-stone-900 leading-snug">
                {ev.title}
              </h3>

              <div className="flex items-center gap-2 text-xs text-stone-500">
                <MapPin className="w-4 h-4 text-secondary-500 shrink-0" />
                <span>{ev.location}</span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed font-body">
                {ev.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SENI TRADISIONAL KHAS BANYUMASAN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-20">
        <div className="border-b border-stone-200 pb-4">
          <span className="text-xs uppercase tracking-widest text-secondary-600 font-bold block">
            Warisan Leluhur
          </span>
          <h2 className="font-editorial text-3xl font-bold text-primary-950 mt-1">
            Kesenian & Tradisi Luhur
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {arts.map((art, idx) => {
            const Icon = art.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-base text-stone-900">
                  {art.name}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-body">
                  {art.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
