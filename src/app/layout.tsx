import type { Metadata } from "next";
import "./globals.css";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE, siteUrl } from "@/lib/seo";

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
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
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
        {/* Fonts loaded via CSS @import in globals.css */}
        {children}
      </body>
    </html>
  );
}
