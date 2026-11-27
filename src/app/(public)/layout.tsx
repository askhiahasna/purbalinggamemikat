import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { getSiteSettings } from "@/server/queries/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSiteSettings();
  const socials = {
    instagram: s.socialInstagram,
    facebook: s.socialFacebook,
    youtube: s.socialYoutube,
    tiktok: s.socialTiktok,
    x: s.socialX,
  };
  return (
    <div className="flex min-h-screen flex-col bg-paper text-slate-dark">
      <PublicNavbar siteName={s.siteName || "Purbalingga Memikat"} logoUrl={s.logoUrl || undefined} socials={socials} />
      <main className="flex-1">{children}</main>
      <PublicFooter siteName={s.siteName || "Purbalingga Memikat"} tagline={s.tagline} logoUrl={s.logoUrl || undefined} socials={socials} contact={{ address: s.contactAddress, phone: s.contactPhone, email: s.contactEmail }} />
      <ScrollReveal />
    </div>
  );
}
