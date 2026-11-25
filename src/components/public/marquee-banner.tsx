import { getSiteSettings } from "@/server/queries/settings";

export async function MarqueeBanner() {
  const settings = await getSiteSettings();
  const items = settings.marqueeItems && settings.marqueeItems.length > 0
    ? settings.marqueeItems
    : [
        "AYO DOLAN PURBALINGGA!",
        "BUMI PERWIRA",
        "PESONA ALAM LERENG GUNUNG SLAMET",
        "KULINER MENDOAN & SOTO KRIYIK",
        "WARISAN TRADISI BANYUMASAN",
      ];

  return (
    <div className="w-full bg-secondary-500 text-primary-950 overflow-hidden py-3 relative z-20 border-y border-secondary-600/30">
      <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs sm:text-sm font-heading font-bold uppercase tracking-widest">
        {[...items, ...items, ...items, ...items].map((text, idx) => (
          <span key={idx} className="flex items-center gap-6">
            <span className="text-white drop-shadow-xs">{text}</span>
            <span className="text-secondary-200">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
