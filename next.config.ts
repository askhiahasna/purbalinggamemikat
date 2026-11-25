import type { NextConfig } from "next";

// Foto disimpan di Supabase Storage (bucket publik). Domain diambil dari env agar tidak di-hardcode.
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  // Opsional: direktori build terpisah (mis. verifikasi produksi tanpa mengganggu `next dev`).
  ...(process.env.NEXT_DIST_DIR
    ? { distDir: process.env.NEXT_DIST_DIR, typescript: { tsconfigPath: "tsconfig.verify.json" } }
    : {}),
  experimental: {
    cpus: 1,
  },
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
