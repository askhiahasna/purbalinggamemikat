import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { ScrollReveal } from "@/components/public/scroll-reveal";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-slate-dark">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <ScrollReveal />
    </div>
  );
}
