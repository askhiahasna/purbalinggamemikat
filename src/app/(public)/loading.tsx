import { Spinner } from "@/components/ui/spinner";

// Tampil seketika saat berpindah halaman publik (navbar & footer tetap), diganti konten begitu siap.
export default function PublicLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-paper pt-24">
      <Spinner />
    </div>
  );
}
