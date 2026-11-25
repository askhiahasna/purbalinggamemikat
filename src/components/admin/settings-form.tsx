"use client";

import * as React from "react";
import {
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Type,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SiteSettings } from "@/lib/data/cms-store";
import { ImageUploader } from "@/components/admin/image-uploader";
import { updateSiteSettingsAction } from "@/server/actions/cms-actions";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [loading, setLoading] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const [settings, setSettings] = React.useState<SiteSettings>(initial);

  const [newMarqueeText, setNewMarqueeText] = React.useState("");

  const handleAddMarquee = () => {
    if (!newMarqueeText.trim()) return;
    setSettings((prev) => ({
      ...prev,
      marqueeItems: [...prev.marqueeItems, newMarqueeText.trim().toUpperCase()],
    }));
    setNewMarqueeText("");
  };

  const handleRemoveMarquee = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      marqueeItems: prev.marqueeItems.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSavedSuccess(false);

    try {
      const res = await updateSiteSettingsAction(settings);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setErrorMessage(res.error || "Gagal menyimpan pengaturan");
      }
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan saat menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <Badge variant="secondary" className="mb-1 text-[11px]">
            CMS Content Management
          </Badge>
          <h1 className="font-editorial text-3xl font-bold text-primary-950">
            Pengaturan Tampilan & Media CMS
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-body">
            Kelola teks animasi berjalan, identitas logo, tulisan beranda, dan profil resmi secara real-time.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSave}
          disabled={loading}
          variant="secondary"
          size="md"
          className="shadow-md"
        >
          {loading ? (
            <span>Menyimpan...</span>
          ) : (
            <>
              <Save className="w-4 h-4 mr-1.5" />
              <span>Simpan Perubahan</span>
            </>
          )}
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Pengaturan tampilan berhasil diperbarui dan telah diterapkan ke halaman website publik!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. TEKS ANIMASI BERJALAN (MARQUEE) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary-500" />
              <h2 className="font-heading font-bold text-base text-stone-900">
                1. Teks Animasi Berjalan (Running Marquee)
              </h2>
            </div>
            <span className="text-[11px] text-stone-400">
              Dapat diedit dan ditambah kapan saja
            </span>
          </div>

          <p className="text-xs text-stone-500">
            Teks di bawah ini akan bergulir secara otomatis pada pita kuning emas di halaman beranda.
          </p>

          {/* Current Marquee Items List */}
          <div className="space-y-2">
            {settings.marqueeItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary-100 text-secondary-800 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-semibold">{item}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMarquee(idx)}
                  className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                  title="Hapus baris ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Item */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newMarqueeText}
              onChange={(e) => setNewMarqueeText(e.target.value)}
              placeholder="Ketik teks baru (misal: 'SELAMAT DATANG DI BUMI PERWIRA!')..."
              className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-primary-800"
            />
            <Button
              type="button"
              onClick={handleAddMarquee}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Tambah Teks
            </Button>
          </div>
        </div>

        {/* 2. IDENTITAS & BRANDING (Logo, Nama Situs) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <ImageIcon className="w-5 h-5 text-secondary-500" />
            <h2 className="font-heading font-bold text-base text-stone-900">
              2. Identitas Merek, Logo & Media
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="site-name-input" className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Situs (Font Federo)
              </label>
              <input
                id="site-name-input"
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-brand text-stone-900 focus:outline-none focus:border-primary-800"
              />
            </div>

            <div>
              <label htmlFor="tagline-input" className="block text-xs font-semibold text-stone-700 mb-1">
                Tagline Resmi
              </label>
              <input
                id="tagline-input"
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-primary-800"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <ImageUploader
                scope="pengaturan"
                label="Logo (tampil di navbar & footer)"
                value={settings.logoUrl}
                onChange={(url) => setSettings((p) => ({ ...p, logoUrl: url }))}
              />
              <p className="text-[11px] text-stone-400">
                Disarankan PNG/WebP persegi dengan latar transparan. Kosongkan untuk memakai lambang kompas bawaan.
              </p>
            </div>
          </div>
        </div>

        {/* 2b. MEDIA SOSIAL */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Sparkles className="w-5 h-5 text-secondary-500" />
            <h2 className="font-heading font-bold text-base text-stone-900">Media Sosial</h2>
          </div>
          <p className="text-xs text-stone-500">
            Tautan tampil sebagai ikon di navbar dan footer. Kosongkan untuk menyembunyikan. Harus diawali <code>https://</code>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {(
              [
                ["socialInstagram", "Instagram", "https://instagram.com/akun"],
                ["socialFacebook", "Facebook", "https://facebook.com/halaman"],
                ["socialYoutube", "YouTube", "https://youtube.com/@kanal"],
                ["socialTiktok", "TikTok", "https://tiktok.com/@akun"],
                ["socialX", "X (Twitter)", "https://x.com/akun"],
              ] as const
            ).map(([key, label, ph]) => (
              <div key={key}>
                <label htmlFor={`${key}-input`} className="block font-semibold text-stone-700 mb-1">
                  {label}
                </label>
                <input
                  id={`${key}-input`}
                  type="url"
                  inputMode="url"
                  value={settings[key]}
                  onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={ph}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-primary-800"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. TEKS HERO UTAMA BERANDA */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Type className="w-5 h-5 text-secondary-500" />
            <h2 className="font-heading font-bold text-base text-stone-900">
              3. Teks Hero Banner Beranda
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="hero-prefix-input" className="block text-xs font-semibold text-stone-700 mb-1">
                Awalan Judul (Font Poppins)
              </label>
              <input
                id="hero-prefix-input"
                type="text"
                value={settings.heroTitlePrefix}
                onChange={(e) =>
                  setSettings({ ...settings, heroTitlePrefix: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-heading text-stone-900 focus:outline-none focus:border-primary-800"
              />
            </div>

            <div>
              <label htmlFor="hero-main-input" className="block text-xs font-semibold text-stone-700 mb-1">
                Judul Utama (Font DM Serif Display)
              </label>
              <input
                id="hero-main-input"
                type="text"
                value={settings.heroTitleMain}
                onChange={(e) =>
                  setSettings({ ...settings, heroTitleMain: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-editorial font-bold text-stone-900 focus:outline-none focus:border-primary-800"
              />
            </div>

            <div>
              <label htmlFor="hero-badge-input" className="block text-xs font-semibold text-stone-700 mb-1">
                Teks Badge Aksen
              </label>
              <input
                id="hero-badge-input"
                type="text"
                value={settings.heroBadge}
                onChange={(e) =>
                  setSettings({ ...settings, heroBadge: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-primary-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="hero-sub-input" className="block text-xs font-semibold text-stone-700 mb-1">
                Deskripsi / Subjudul Hero
              </label>
              <textarea
                id="hero-sub-input"
                rows={2}
                value={settings.heroSubtitle}
                onChange={(e) =>
                  setSettings({ ...settings, heroSubtitle: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-primary-800"
              />
            </div>
          </div>
        </div>

        {/* 3b. FOTO BERANDA (Supabase Storage) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <ImageIcon className="w-5 h-5 text-secondary-500" />
            <h2 className="font-heading font-bold text-base text-stone-900">Foto Beranda</h2>
          </div>
          <p className="text-xs text-stone-500">
            Foto disimpan di Supabase Storage dan baru berlaku setelah menekan <strong>Simpan Perubahan</strong>. Bila
            dikosongkan, beranda memakai foto bawaan (hero) atau foto dari konten (kartu statistik).
          </p>

          <div className="space-y-5 text-xs">
            <div className="space-y-1">
              <ImageUploader
                scope="pengaturan"
                label="Foto Background Hero"
                value={settings.heroBgUrl}
                onChange={(url) => setSettings((p) => ({ ...p, heroBgUrl: url }))}
              />
              <p className="text-[11px] text-stone-400">Disarankan lanskap beresolusi tinggi (min. 1600 px). Memudar dari atas ke hijau solid #174C3C di bawah agar teks terbaca.</p>
            </div>

            <div className="space-y-1 pt-2 border-t border-stone-100">
              <ImageUploader
                scope="pengaturan"
                label="Foto Bupati & Wakil Bupati (satu foto gabungan)"
                value={settings.leadersPhotoUrl}
                onChange={(url) => setSettings((p) => ({ ...p, leadersPhotoUrl: url }))}
              />
              <p className="text-[11px] text-stone-400">
                Tampil di bagian Sambutan beranda dengan label nama mengambang. Disarankan foto berdua, orientasi landscape/persegi.
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-stone-100">
              <p className="font-semibold text-stone-700">Foto Hero Halaman Menu</p>
              <p className="text-[11px] text-stone-400">
                Foto latar bagian atas tiap halaman. Bila kosong dipakai foto dari konten halaman itu, lalu foto hero beranda.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ImageUploader scope="pengaturan" label="Hero halaman Kuliner" value={settings.heroPageKuliner} onChange={(url) => setSettings((p) => ({ ...p, heroPageKuliner: url }))} />
                <ImageUploader scope="pengaturan" label="Hero halaman Jelajah / Destinasi" value={settings.heroPageDestinasi} onChange={(url) => setSettings((p) => ({ ...p, heroPageDestinasi: url }))} />
                <ImageUploader scope="pengaturan" label="Hero halaman Acara & Budaya" value={settings.heroPageEvent} onChange={(url) => setSettings((p) => ({ ...p, heroPageEvent: url }))} />
                <ImageUploader scope="pengaturan" label="Hero halaman Akomodasi" value={settings.heroPageAkomodasi} onChange={(url) => setSettings((p) => ({ ...p, heroPageAkomodasi: url }))} />
                <ImageUploader scope="pengaturan" label="Hero halaman UMKM" value={settings.heroPageUmkm} onChange={(url) => setSettings((p) => ({ ...p, heroPageUmkm: url }))} />
                <ImageUploader scope="pengaturan" label="Hero halaman Berita" value={settings.heroPageBerita} onChange={(url) => setSettings((p) => ({ ...p, heroPageBerita: url }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-stone-100">
              <ImageUploader scope="pengaturan" label="Gambar Kartu Statistik 1 (Destinasi Wisata)" value={settings.statImage1Url} onChange={(url) => setSettings((p) => ({ ...p, statImage1Url: url }))} />
              <ImageUploader scope="pengaturan" label="Gambar Kartu Statistik 2 (Kecamatan)" value={settings.statImage2Url} onChange={(url) => setSettings((p) => ({ ...p, statImage2Url: url }))} />
              <ImageUploader scope="pengaturan" label="Gambar Kartu Statistik 3 (Kuliner & UMKM)" value={settings.statImage3Url} onChange={(url) => setSettings((p) => ({ ...p, statImage3Url: url }))} />
              <ImageUploader scope="pengaturan" label="Gambar Kartu Statistik 4 (Desa Wisata)" value={settings.statImage4Url} onChange={(url) => setSettings((p) => ({ ...p, statImage4Url: url }))} />
            </div>
          </div>
        </div>

        {/* 4. DATA SEKILAS PURBALINGGA & PIMPINAN */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Sliders className="w-5 h-5 text-secondary-500" />
            <h2 className="font-heading font-bold text-base text-stone-900">
              4. Data Sekilas Purbalingga & Profil Pemimpin
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="leader1-name-input" className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Bupati
              </label>
              <input
                id="leader1-name-input"
                type="text"
                value={settings.leader1Name}
                onChange={(e) =>
                  setSettings({ ...settings, leader1Name: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-primary-800"
              />
            </div>

            <div>
              <label htmlFor="leader2-name-input" className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Wakil Bupati
              </label>
              <input
                id="leader2-name-input"
                type="text"
                value={settings.leader2Name}
                onChange={(e) =>
                  setSettings({ ...settings, leader2Name: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-primary-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="sekilas-quote-input" className="block text-xs font-semibold text-stone-700 mb-1">
                Kutipan / Visi Resmi Pimpinan
              </label>
              <input
                id="sekilas-quote-input"
                type="text"
                value={settings.sekilasQuote}
                onChange={(e) =>
                  setSettings({ ...settings, sekilasQuote: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-primary-800"
              />
            </div>
          </div>
        </div>

        {/* 5. KONTAK & TIC */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Phone className="w-5 h-5 text-secondary-500" />
            <h2 className="font-heading font-bold text-base text-stone-900">
              5. Informasi Kontak Resmi & TIC
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="contact-phone-input" className="block text-xs font-semibold text-stone-700 mb-1">
                Nomor Telepon TIC Disporapar
              </label>
              <input
                id="contact-phone-input"
                type="text"
                value={settings.contactPhone}
                onChange={(e) =>
                  setSettings({ ...settings, contactPhone: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-primary-800"
              />
            </div>

            <div>
              <label htmlFor="contact-email-input" className="block text-xs font-semibold text-stone-700 mb-1">
                Email Resmi Layanan
              </label>
              <input
                id="contact-email-input"
                type="text"
                value={settings.contactEmail}
                onChange={(e) =>
                  setSettings({ ...settings, contactEmail: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-primary-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="contact-addr-input" className="block text-xs font-semibold text-stone-700 mb-1">
                Alamat Kantor
              </label>
              <input
                id="contact-addr-input"
                type="text"
                value={settings.contactAddress}
                onChange={(e) =>
                  setSettings({ ...settings, contactAddress: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-primary-800"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar Bottom */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <p className="text-xs text-stone-500">
            * Setiap perubahan akan disimpan ke berkas CMS dan langsung memperbarui tampilan publik.
          </p>
          <Button
            type="submit"
            disabled={loading}
            variant="secondary"
            size="md"
            className="shadow-md"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>Simpan Semua Pengaturan</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
