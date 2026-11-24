// Pembatas laju in-memory (jendela tetap). Cukup untuk 1 instance server; untuk multi-instance
// ganti implementasinya dengan penyimpanan bersama (mis. Redis) tanpa mengubah pemanggil.

interface Entry {
  n: number;
  reset: number;
}

const g = globalThis as unknown as { __rateLimiters?: Map<string, Map<string, Entry>> };
const registry = (g.__rateLimiters ??= new Map());

export function createLimiter(name: string, windowMs: number, max: number) {
  let store = registry.get(name);
  if (!store) {
    store = new Map();
    registry.set(name, store);
  }
  const map = store;

  const live = (key: string) => {
    const e = map.get(key);
    if (!e) return undefined;
    if (e.reset < Date.now()) {
      map.delete(key);
      return undefined;
    }
    return e;
  };

  const prune = () => {
    if (map.size < 5000) return;
    const now = Date.now();
    for (const [k, e] of map) if (e.reset < now) map.delete(k);
  };

  return {
    /** Sudah mencapai batas? (tidak menambah hitungan) */
    isLimited: (key: string) => (live(key)?.n ?? 0) >= max,
    /** Catat satu kejadian (mis. login gagal). */
    hit: (key: string) => {
      prune();
      const e = live(key);
      if (e) e.n++;
      else map.set(key, { n: 1, reset: Date.now() + windowMs });
    },
    clear: (key: string) => void map.delete(key),
    /** Catat kejadian bila belum melewati batas; false bila ditolak. */
    take: (key: string) => {
      if ((live(key)?.n ?? 0) >= max) return false;
      const e = live(key);
      if (e) e.n++;
      else map.set(key, { n: 1, reset: Date.now() + windowMs });
      prune();
      return true;
    },
  };
}
