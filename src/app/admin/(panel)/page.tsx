import Link from "next/link";
import {
  MapPin,
  Utensils,
  Calendar,
  ShoppingBag,
  Newspaper,
  MessageSquare,
  Inbox,
  Settings,
  Users,
  ArrowRight,
  AlertCircle,
  Star,
  ImageOff,
  BedDouble,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/server/auth/dal";
import { getStaffDashboard, getManagerDashboard } from "@/server/queries/dashboard";
import { ALL_ROLES, ROLE_LABEL, canAccessRoute, type AppRole } from "@/lib/auth/permissions";
import { requirePageRole } from "@/server/auth/dal";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  COMPLAINT: "Pengaduan",
  CONTACT: "Kontak",
  OPERATOR_REGISTRATION: "Pendaftaran",
  SURVEY: "Survei",
};

interface QuickLink {
  href: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

// Tautan cepat difilter dengan canAccessRoute() sehingga mengikuti hak akses role.
const QUICK_LINKS: QuickLink[] = [
  { href: "/admin/destinasi", title: "Kelola Destinasi", desc: "Tarif tiket, jam buka, dan galeri foto.", icon: MapPin },
  { href: "/admin/kuliner", title: "Kelola Kuliner", desc: "Katalog makanan khas dan oleh-oleh.", icon: Utensils },
  { href: "/admin/event", title: "Kalender Event", desc: "Agenda festival dan tradisi budaya.", icon: Calendar },
  { href: "/admin/umkm", title: "UMKM & Produk", desc: "Pelaku usaha dan produk unggulan.", icon: ShoppingBag },
  { href: "/admin/akomodasi", title: "Akomodasi", desc: "Hotel, homestay, dan penginapan wisata.", icon: BedDouble },
  { href: "/admin/berita", title: "Berita & Warta", desc: "Tulis dan terbitkan berita.", icon: Newspaper },
  { href: "/admin/moderasi", title: "Moderasi Ulasan", desc: "Setujui ulasan pengunjung.", icon: MessageSquare },
  { href: "/admin/layanan", title: "Layanan Publik", desc: "Pengaduan, kontak, pendaftaran, survei.", icon: Inbox },
  { href: "/admin/pengaturan", title: "Pengaturan Situs", desc: "Teks hero, marquee, logo, kontak.", icon: Settings },
  { href: "/admin/pengguna", title: "Pengguna & Peran", desc: "Akun dan hak akses admin.", icon: Users },
];

function StatCard({
  title,
  value,
  sub,
  href,
  icon: Icon,
  alert = false,
}: {
  title: string;
  value: number;
  sub: string;
  href: string;
  icon: LucideIcon;
  alert?: boolean;
}) {
  return (
    <Link href={href} className="block group">
      <Card className={`hover:border-primary-800 transition-all hover:shadow-md ${alert ? "border-amber-300 bg-amber-50/40" : ""}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider font-heading">{title}</span>
            <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
              <Icon className="w-5 h-5 text-primary-800" />
            </div>
          </div>
          <p className="font-heading text-3xl font-bold text-stone-900 group-hover:text-primary-800 transition-colors">{value}</p>
          <div className="flex items-center justify-between text-xs text-stone-500 mt-1">
            <span>{sub}</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-secondary-500 transition-opacity" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

const sub = (c: { PUBLISHED: number; DRAFT: number; ARCHIVED: number }) =>
  `${c.PUBLISHED} terbit • ${c.DRAFT} draf${c.ARCHIVED ? ` • ${c.ARCHIVED} arsip` : ""}`;

export default async function AdminDashboardPage() {
  await requirePageRole(ALL_ROLES);
  const user = (await getSession())!;
  const role: AppRole = user.role;
  const links = QUICK_LINKS.filter((l) => canAccessRoute(role, l.href));

  return (
    <div className="space-y-8">
      <div className="border-b border-stone-200 pb-5">
        <Badge variant="primary" className="mb-1 text-[11px]">
          {ROLE_LABEL[role]}
        </Badge>
        <h1 className="font-editorial text-3xl font-bold text-primary-950">Halo, {user.name}</h1>
        <p className="text-xs sm:text-sm text-stone-500 font-body">
          {role === "DESTINATION_MANAGER"
            ? "Ringkasan destinasi yang ditugaskan kepada Anda."
            : "Ringkasan data operasional dan antrean yang perlu ditindaklanjuti."}
        </p>
      </div>

      {role === "DESTINATION_MANAGER" ? <ManagerView userId={user.id} /> : <StaffView role={role} />}

      <section aria-label="Tautan cepat">
        <h2 className="font-heading font-semibold text-sm text-stone-500 uppercase tracking-wider mb-3">Tautan Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-primary-800 hover:shadow-sm transition-all space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center group-hover:bg-primary-800 group-hover:text-white transition-colors">
                <l.icon className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-sm text-stone-900">
                {role === "DESTINATION_MANAGER" && l.href === "/admin/destinasi" ? "Destinasi Saya" : l.title}
              </h3>
              <p className="text-[11px] text-stone-500">{l.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

async function StaffView({ role }: { role: AppRole }) {
  const d = await getStaffDashboard({ includeUsers: role === "SUPER_ADMIN" });

  const attention = [
    { n: d.pendingSubs, text: "pesan layanan publik belum ditangani", href: "/admin/layanan" },
    { n: d.pendingReviews, text: "ulasan menunggu moderasi", href: "/admin/moderasi" },
    { n: d.umkmDrafts, text: "UMKM masih berstatus draf", href: "/admin/umkm" },
    { n: d.articles.DRAFT, text: "berita masih draf", href: "/admin/berita" },
    { n: d.destinationsWithoutPhoto, text: "destinasi tayang tanpa foto", href: "/admin/destinasi" },
  ].filter((a) => a.n > 0);

  return (
    <>
      {attention.length > 0 && (
        <section aria-label="Perlu perhatian" className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <h2 className="flex items-center gap-2 font-heading font-semibold text-sm text-amber-900 mb-3">
            <AlertCircle className="w-4 h-4" /> Perlu Perhatian
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {attention.map((a) => (
              <li key={a.href + a.text}>
                <Link href={a.href} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white border border-amber-200/70 hover:border-amber-400">
                  <span className="text-stone-700">
                    <strong className="text-amber-800">{a.n}</strong> {a.text}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Destinasi" value={d.destinations.total} sub={sub(d.destinations)} href="/admin/destinasi" icon={MapPin} />
        <StatCard title="Kuliner" value={d.culinary.total} sub={sub(d.culinary)} href="/admin/kuliner" icon={Utensils} />
        <StatCard title="Event" value={d.events.total} sub={`${d.events.upcoming} akan datang • ${d.events.DRAFT} draf`} href="/admin/event" icon={Calendar} />
        <StatCard title="UMKM" value={d.businesses.total} sub={sub(d.businesses)} href="/admin/umkm" icon={ShoppingBag} />
        <StatCard title="Akomodasi" value={d.accommodations.total} sub={sub(d.accommodations)} href="/admin/akomodasi" icon={BedDouble} />
        <StatCard title="Berita" value={d.articles.total} sub={sub(d.articles)} href="/admin/berita" icon={Newspaper} />
        <StatCard title="Ulasan Menunggu" value={d.pendingReviews} sub="antrean moderasi" href="/admin/moderasi" icon={MessageSquare} alert={d.pendingReviews > 0} />
        <StatCard
          title="Pesan Baru"
          value={d.pendingSubs}
          sub={
            Object.entries(d.pendingByType)
              .map(([t, n]) => `${n} ${TYPE_LABEL[t] ?? t}`)
              .join(" • ") || "tidak ada antrean"
          }
          href="/admin/layanan"
          icon={Inbox}
          alert={d.pendingSubs > 0}
        />
        {d.users && (
          <StatCard
            title="Pengguna Aktif"
            value={d.users.total}
            sub={`${d.users.byRole.SUPER_ADMIN ?? 0} admin • ${d.users.byRole.EDITOR ?? 0} editor • ${d.users.byRole.DESTINATION_MANAGER ?? 0} pengelola`}
            href="/admin/pengguna"
            icon={Users}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="font-heading font-semibold text-base text-stone-900">Pesan Layanan Terbaru</h2>
            <Link href="/admin/layanan" className="text-xs font-semibold text-primary-800 hover:underline">
              Buka kotak masuk
            </Link>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {d.recentSubs.length === 0 && <p className="text-xs text-stone-400">Belum ada pesan yang perlu ditangani.</p>}
            {d.recentSubs.map((s) => (
              <Link
                key={s.id}
                href="/admin/layanan"
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs hover:border-primary-300"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-stone-800 truncate">
                    {s.senderName} <span className="font-normal text-stone-400">• {TYPE_LABEL[s.type]}</span>
                  </p>
                  <p className="text-stone-500 truncate">{s.subject}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-stone-400 text-[11px] block">{s.ago}</span>
                  {s.status === "PENDING" && <Badge variant="warning">Baru</Badge>}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="font-heading font-semibold text-base text-stone-900">Antrean Moderasi Ulasan</h2>
            <Link href="/admin/moderasi" className="text-xs font-semibold text-primary-800 hover:underline">
              Moderasi
            </Link>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {d.reviewQueue.length === 0 && <p className="text-xs text-stone-400">Tidak ada ulasan yang menunggu.</p>}
            {d.reviewQueue.map((r) => (
              <Link
                key={r.id}
                href="/admin/moderasi"
                className="block p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs hover:border-primary-300"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-stone-800 truncate">
                    {r.author} <span className="font-normal text-stone-400">• {r.destination}</span>
                  </span>
                  <span className="flex items-center gap-0.5 text-amber-500 shrink-0">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {r.rating}
                  </span>
                </div>
                <p className="text-stone-500 line-clamp-1">{r.comment}</p>
                <span className="text-[11px] text-stone-400">{r.ago}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-stone-100 pb-4">
          <h2 className="font-heading font-semibold text-base text-stone-900">Event Mendatang</h2>
          <Link href="/admin/event" className="text-xs font-semibold text-primary-800 hover:underline">
            Kelola event
          </Link>
        </CardHeader>
        <CardContent className="p-6">
          {d.nextEvents.length === 0 ? (
            <p className="text-xs text-stone-400">Belum ada event terjadwal. Tambahkan di menu Kalender Event.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {d.nextEvents.map((e) => (
                <li key={e.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs space-y-0.5">
                  <p className="font-semibold text-stone-800">{e.title}</p>
                  <p className="text-secondary-700 font-medium">{e.date}</p>
                  <p className="text-stone-500">{e.location}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}

async function ManagerView({ userId }: { userId: string }) {
  const rows = await getManagerDashboard(userId);
  return (
    <section aria-label="Destinasi saya" className="space-y-4">
      <h2 className="font-heading font-semibold text-sm text-stone-500 uppercase tracking-wider">Destinasi yang Anda Kelola</h2>
      {rows.length === 0 ? (
        <div className="p-6 rounded-2xl border border-dashed border-stone-300 text-xs text-stone-500">
          Belum ada destinasi yang ditugaskan kepada akun Anda. Hubungi Super Admin untuk penugasan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rows.map((r) => (
            <Link key={r.id} href="/admin/destinasi" className="block group">
              <Card className="hover:border-primary-800 hover:shadow-md transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading font-bold text-base text-stone-900 group-hover:text-primary-800">{r.name}</h3>
                      <p className="text-xs text-stone-500">Kec. {r.district}</p>
                    </div>
                    <Badge variant={r.status === "PUBLISHED" ? "primary" : "warning"}>{r.status === "PUBLISHED" ? "Tayang" : r.status}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-stone-50 p-2">
                      <p className="font-heading text-lg font-bold text-stone-900">{r.photos}</p>
                      <p className="text-stone-500">foto</p>
                    </div>
                    <div className="rounded-lg bg-stone-50 p-2">
                      <p className="font-heading text-lg font-bold text-stone-900">{r.reviewCount ? r.rating : "–"}</p>
                      <p className="text-stone-500">rating</p>
                    </div>
                    <div className="rounded-lg bg-stone-50 p-2">
                      <p className="font-heading text-lg font-bold text-stone-900">{r.reviewCount}</p>
                      <p className="text-stone-500">ulasan</p>
                    </div>
                  </div>
                  {r.photos === 0 && (
                    <p className="flex items-center gap-1.5 text-[11px] text-amber-700">
                      <ImageOff className="w-3.5 h-3.5" /> Belum ada foto — unggah di menu Destinasi → Galeri.
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
