"use client";

import * as React from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitServiceAction } from "@/server/actions/service-actions";

type Tab = "pengaduan" | "kontak" | "daftar" | "survei";

const TABS: { id: Tab; label: string }[] = [
  { id: "pengaduan", label: "Aspirasi & Pengaduan" },
  { id: "kontak", label: "Kontak & Pertanyaan" },
  { id: "daftar", label: "Daftar Usaha / Wisata" },
  { id: "survei", label: "Survei Kepuasan" },
];

const input =
  "w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-primary-500";
const labelCls = "block text-xs font-semibold text-stone-700 mb-1";

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function ServiceForms() {
  const [tab, setTab] = React.useState<Tab>("pengaduan");
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  const switchTab = (t: Tab) => {
    setTab(t);
    setDone(false);
    setError("");
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = (k: string) => String(fd.get(k) ?? "");
    setError("");

    const common = { name: v("name"), email: v("email"), phone: v("phone"), website: v("website") };
    let payload: Record<string, unknown>;
    if (tab === "pengaduan") payload = { kind: "complaint", ...common, subject: v("subject"), message: v("message") };
    else if (tab === "kontak") payload = { kind: "contact", ...common, subject: v("subject"), message: v("message") };
    else if (tab === "daftar")
      payload = {
        kind: "registration",
        ...common,
        businessKind: v("businessKind"),
        businessName: v("businessName"),
        district: v("district"),
        address: v("address"),
        description: v("message"),
      };
    else payload = { kind: "survey", ...common, rating: v("rating"), message: v("message") };

    startTransition(async () => {
      const res = await submitServiceAction(payload);
      if (res.success) {
        setDone(true);
        formRef.current?.reset();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div role="tablist" className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-100 p-1 rounded-2xl">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => switchTab(t.id)}
            className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === t.id ? "bg-primary-900 text-white shadow" : "text-stone-700 hover:bg-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {done ? (
        <div role="status" className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-heading font-bold text-base">Terima Kasih!</h4>
            <p className="mt-1">
              {tab === "survei"
                ? "Penilaian Anda telah kami terima dan membantu kami meningkatkan layanan pariwisata."
                : "Formulir Anda telah terkirim dan akan ditinjau oleh dinas terkait. Kami akan menghubungi Anda melalui kontak yang diberikan."}
            </p>
            <button type="button" onClick={() => setDone(false)} className="mt-3 text-xs font-semibold text-emerald-800 underline cursor-pointer">
              Kirim formulir lain
            </button>
          </div>
        </div>
      ) : (
        <form key={tab} ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate={false}>
          {/* Honeypot: disembunyikan dari pengguna; bot biasanya mengisinya. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="svc-website">Jangan diisi</label>
            <input id="svc-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="svc-name" label={tab === "survei" ? "Nama (opsional)" : "Nama Lengkap *"}>
              <input id="svc-name" name="name" type="text" required={tab !== "survei"} maxLength={100} placeholder="Nama Anda..." className={input} />
            </Field>
            <Field id="svc-email" label={tab === "survei" ? "Email (opsional)" : "Email *"}>
              <input id="svc-email" name="email" type="email" maxLength={200} placeholder="email@domain.com" className={input} />
            </Field>
            {tab !== "survei" && (
              <Field id="svc-phone" label="WhatsApp (isi email atau WhatsApp)">
                <input id="svc-phone" name="phone" type="tel" maxLength={25} placeholder="0812..." className={input} />
              </Field>
            )}
          </div>

          {(tab === "pengaduan" || tab === "kontak") && (
            <>
              <Field id="svc-subject" label={tab === "pengaduan" ? "Subjek Pengaduan / Lokasi Destinasi *" : "Subjek *"}>
                <input
                  id="svc-subject"
                  name="subject"
                  type="text"
                  required
                  minLength={3}
                  maxLength={200}
                  placeholder={tab === "pengaduan" ? "Contoh: Lampu penerangan di akses Goa Lawa..." : "Topik pertanyaan Anda..."}
                  className={input}
                />
              </Field>
              <Field id="svc-message" label={tab === "pengaduan" ? "Isi Aspirasi / Pengaduan Lengkap *" : "Pesan *"}>
                <textarea id="svc-message" name="message" rows={4} required minLength={tab === "pengaduan" ? 10 : 5} maxLength={4000} className={input} />
              </Field>
            </>
          )}

          {tab === "daftar" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field id="svc-kind" label="Jenis Pendaftaran *">
                  <select id="svc-kind" name="businessKind" className={input} defaultValue="UMKM">
                    <option value="UMKM">UMKM / Produk Lokal</option>
                    <option value="WISATA">Pengelola Wisata / Desa Wisata</option>
                  </select>
                </Field>
                <Field id="svc-bname" label="Nama Usaha / Objek Wisata / Pokdarwis *">
                  <input id="svc-bname" name="businessName" type="text" required minLength={3} maxLength={150} className={input} />
                </Field>
                <Field id="svc-district" label="Kecamatan *">
                  <input id="svc-district" name="district" type="text" required maxLength={80} placeholder="Kecamatan di Purbalingga..." className={input} />
                </Field>
                <Field id="svc-address" label="Alamat (opsional)">
                  <input id="svc-address" name="address" type="text" maxLength={300} className={input} />
                </Field>
              </div>
              <Field id="svc-message" label="Deskripsi Produk / Fasilitas Wisata *">
                <textarea
                  id="svc-message"
                  name="message"
                  rows={4}
                  required
                  minLength={10}
                  maxLength={3000}
                  placeholder="Jelaskan jenis kuliner, produk kerajinan, atau paket wisata yang ditawarkan..."
                  className={input}
                />
              </Field>
              <p className="text-[11px] text-stone-500">
                Pendaftaran akan diverifikasi petugas sebelum ditampilkan di portal. Belum tentu langsung tayang.
              </p>
            </>
          )}

          {tab === "survei" && (
            <>
              <Field id="svc-rating" label="Seberapa puas Anda dengan pengalaman berwisata di Purbalingga? *">
                <select id="svc-rating" name="rating" defaultValue="5" className={input}>
                  <option value="5">5 — Sangat Puas</option>
                  <option value="4">4 — Puas</option>
                  <option value="3">3 — Cukup Puas</option>
                  <option value="2">2 — Kurang Puas</option>
                  <option value="1">1 — Tidak Puas</option>
                </select>
              </Field>
              <Field id="svc-message" label="Kesan & Saran untuk Perbaikan Layanan *">
                <textarea
                  id="svc-message"
                  name="message"
                  rows={4}
                  required
                  minLength={3}
                  maxLength={2000}
                  placeholder="Tuliskan saran Anda mengenai kebersihan, tarif, keramahan petugas..."
                  className={input}
                />
              </Field>
            </>
          )}

          {error && (
            <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between gap-3">
            <span className="text-[11px] text-stone-400">* Wajib diisi. Data ditangani resmi oleh Pemkab Purbalingga.</span>
            <Button type="submit" variant="secondary" size="md" disabled={pending}>
              <Send className="w-4 h-4 mr-1.5" />
              {pending ? "Mengirim..." : "Kirimkan Formulir"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
