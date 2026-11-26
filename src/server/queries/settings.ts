import { cached } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS, DEPRECATED_SETTING_KEYS, type SiteSettings } from "@/lib/data/cms-store";

const SETTINGS_KEY = "site";

/** Baca langsung dari DB (tanpa cache) — untuk jalur tulis/admin agar merge memakai data terbaru. */
export async function getSiteSettingsFresh(): Promise<SiteSettings> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } });
    if (row && typeof row.value === "object" && row.value !== null && !Array.isArray(row.value)) {
      return { ...DEFAULT_SETTINGS, ...(row.value as Partial<SiteSettings>) };
    }
  } catch (err) {
    console.error("Gagal membaca site settings dari database, memakai default", err);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettingsFresh();
  const updated: SiteSettings = { ...current, ...patch };
  for (const k of DEPRECATED_SETTING_KEYS) delete (updated as unknown as Record<string, unknown>)[k];
  await prisma.siteSetting.upsert({
    where: { key: SETTINGS_KEY },
    update: { value: updated as object },
    create: { key: SETTINGS_KEY, value: updated as object },
  });
  return updated;
}

/** Versi ter-cache untuk halaman publik (layout membacanya di setiap navigasi). */
export const getSiteSettings = cached(getSiteSettingsFresh, "getSiteSettings");
