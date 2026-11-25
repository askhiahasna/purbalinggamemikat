import type { Metadata } from "next";
import { DM_Serif_Display, Federo, Montserrat, Oswald, Poppins } from "next/font/google";
import "./globals.css";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE, siteUrl } from "@/lib/seo";

// Web font di-host sendiri oleh Next (diunduh saat build) — tidak ada request ke Google saat runtime.
// Peran: Federo = identitas merek, Poppins = judul pendukung, DM Serif Display = judul editorial, Montserrat = isi.
const federo = Federo({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-federo" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-poppins" });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-dm-serif" });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], style: ["normal", "italic"], display: "swap", variable: "--font-montserrat" });

const oswald = Oswald({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], display: "swap", variable: "--font-oswald" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} - ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Purbalingga",
    "wisata Purbalingga",
    "Owabong",
    "Goa Lawa",
    "kuliner Purbalingga",
    "UMKM Purbalingga",
    "event budaya Purbalingga",
    "Jawa Tengah",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "id_ID",
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: `${SITE_NAME} - ${SITE_TAGLINE}`, description: DEFAULT_DESCRIPTION },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`h-full antialiased ${federo.variable} ${poppins.variable} ${dmSerif.variable} ${montserrat.variable} ${oswald.variable}`} suppressHydrationWarning>
      <head>
        {/* Aktifkan mode animasi sebelum cat pertama (tanpa kilatan); dilewati bila pengguna memilih kurangi gerakan. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('reveal-ready')}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-body selection:bg-secondary-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
