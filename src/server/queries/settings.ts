import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/data/cms-store";

const SETTINGS_KEY = "site";

export async function getSiteSettings(): Promise<SiteSettings> {
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
  const current = await getSiteSettings();
  const updated: SiteSettings = { ...current, ...patch };
  await prisma.siteSetting.upsert({
    where: { key: SETTINGS_KEY },
    update: { value: updated as object },
    create: { key: SETTINGS_KEY, value: updated as object },
  });
  return updated;
}
