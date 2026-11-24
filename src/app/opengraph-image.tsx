import { ImageResponse } from "next/og";

// Gambar OG bawaan (dipakai saat halaman tidak punya foto sendiri).
// Warna mengikuti palet sementara proyek — bukan identitas resmi pemerintah.
export const alt = "Purbalingga Memikat - Pesona Wisata & Potensi Daerah";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0f3328 0%, #174C3C 55%, #2a6b57 100%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: "#D7A94B", textTransform: "uppercase" }}>
          Kabupaten Purbalingga
        </div>
        <div style={{ display: "flex", fontSize: 112, fontWeight: 700, marginTop: 24, lineHeight: 1.05 }}>
          Purbalingga Memikat
        </div>
        <div style={{ display: "flex", fontSize: 38, marginTop: 28, color: "#e7e5e4" }}>
          Pesona Wisata, Budaya, Kuliner & Potensi Daerah
        </div>
        <div style={{ display: "flex", width: 160, height: 8, background: "#D7A94B", marginTop: 48, borderRadius: 4 }} />
      </div>
    ),
    size
  );
}
