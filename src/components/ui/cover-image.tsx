import Image from "next/image";

/**
 * Foto penutup untuk wadah bergradient. Induk harus `relative isolate overflow-hidden`;
 * foto ada di bawah konten (-z-10) tetapi di atas gradient placeholder. Tanpa `src` tidak merender apa pun,
 * sehingga gradient lama tetap menjadi fallback.
 */
export function CoverImage({
  src,
  alt = "",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
}: {
  src: string | null | undefined;
  alt?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) return null;
  return (
    <>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover -z-10 transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
    </>
  );
}

/** Foto bingkai biasa (kartu UMKM/Event) — hanya tampil bila ada foto. */
export function CardPhoto({ src, alt, className = "h-44" }: { src: string | null | undefined; alt: string; className?: string }) {
  if (!src) return null;
  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-stone-100 ${className}`}>
      <Image src={src} alt={alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
    </div>
  );
}
