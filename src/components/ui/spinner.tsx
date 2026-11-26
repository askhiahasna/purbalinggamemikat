/** Simbol loading: cincin berputar. Berputar tetap terlihat walau reduced-motion (diganti denyut halus lewat CSS). */
export function Spinner({ label = "Memuat…", className = "" }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center gap-4 ${className}`}>
      <span className="pm-spinner" aria-hidden="true" />
      <span className="text-sm font-medium text-primary-800/80">{label}</span>
    </div>
  );
}
