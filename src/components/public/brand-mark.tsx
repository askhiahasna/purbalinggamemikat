import Image from "next/image";
import { Compass } from "lucide-react";

/** Lambang merek: logo unggahan admin (next/image) atau ikon kompas bawaan. */
export function BrandMark({ logoUrl, className = "w-10 h-10" }: { logoUrl?: string; className?: string }) {
  return (
    <div className={`relative ${className} rounded-xl bg-primary-800 border border-secondary-400/50 flex items-center justify-center shadow-md overflow-hidden shrink-0`}>
      {logoUrl ? (
        <Image src={logoUrl} alt="" fill sizes="48px" className="object-contain p-1" />
      ) : (
        <Compass className="w-6 h-6 text-secondary-400" aria-hidden="true" />
      )}
    </div>
  );
}
