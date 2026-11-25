/** Ubah nomor lokal ("0812-3456-7890", "+62 812...") menjadi format wa.me ("628123456789"); null bila tidak masuk akal. */
export function toWaNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = raw.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return /^\d{8,15}$/.test(d) ? d : null;
}

export function waLink(raw: string | null | undefined, text?: string): string | null {
  const n = toWaNumber(raw);
  return n ? `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}` : null;
}

/** "Rp 150.000" atau "Rp 150.000 - Rp 400.000"; null bila tidak ada harga. */
export function priceRangeLabel(from: number | null, to: number | null): string | null {
  const f = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
  if (from !== null && to !== null && to !== from) return `${f(from)} - ${f(to)}`;
  const one = from ?? to;
  return one !== null ? f(one) : null;
}
