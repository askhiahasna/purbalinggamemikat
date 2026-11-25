"use client";

import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Ticket,
  Star,
  Phone,
  Share2,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Send,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import type { DestinationDetail } from "@/types/destination";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { submitReviewAction } from "@/server/actions/content-actions";
import { CoverImage } from "@/components/ui/cover-image";
import { WishlistButton } from "@/components/public/wishlist";
import Image from "next/image";

export function DestinationDetailView({
  destination,
  nearby,
}: {
  destination: DestinationDetail;
  nearby: DestinationDetail[];
}) {
  const [activeTab, setActiveTab] = React.useState<"info" | "fasilitas" | "ulasan">("info");
  const [copiedShare, setCopiedShare] = React.useState(false);

  // Review Form States
  const [reviewerName, setReviewerName] = React.useState("");
  const [reviewerRating, setReviewerRating] = React.useState(5);
  const [reviewerComment, setReviewerComment] = React.useState("");
  const [reviewSubmitted, setReviewSubmitted] = React.useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const [reviewPending, startReview] = React.useTransition();
  const [reviewError, setReviewError] = React.useState("");

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) return;
    setReviewError("");
    startReview(async () => {
      const res = await submitReviewAction({
        destinationId: destination.id,
        authorName: reviewerName,
        rating: reviewerRating,
        comment: reviewerComment,
      });
      if (res.success) {
        setReviewSubmitted(true);
        setReviewerName("");
        setReviewerComment("");
        setTimeout(() => setReviewSubmitted(false), 5000);
      } else {
        setReviewError(res.error);
      }
    });
  };

  return (
    <div className="space-y-10 pb-20">
      {/* 1. TOP BREADCRUMB */}
      <div className="bg-stone-100 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Link href="/" className="hover:text-primary-700">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/destinasi" className="hover:text-primary-700">
              Destinasi
            </Link>
            <span>/</span>
            <span className="font-semibold text-primary-950 truncate max-w-[200px] sm:max-w-none">
              {destination.name}
            </span>
          </div>

          <Link href="/destinasi" className="hidden sm:inline-flex items-center gap-1 text-primary-700 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Katalog
          </Link>
        </div>
      </div>

      {/* 2. DESTINATION HERO HEADER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1 text-xs font-bold">
                {destination.categoryLabel}
              </Badge>
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-secondary-500" />
                Kecamatan {destination.district}
              </span>
            </div>

            {/* Share Button */}
            <WishlistButton slug={destination.slug} name={destination.name} className="!bg-stone-100 !text-stone-600 !border-stone-200 hover:!bg-stone-200" />
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-stone-600" />
              <span>{copiedShare ? "Tautan Tersalin!" : "Bagikan"}</span>
            </button>
          </div>

          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-primary-950">
            {destination.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{destination.rating}</span>
              <span className="text-stone-400 font-normal">({destination.reviewCount} ulasan)</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-emerald-700 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Buka Hari Ini: {destination.openingHours}</span>
            </div>
          </div>
        </div>

        {/* Big Cover Photo Frame */}
        <div className={`mt-6 h-72 sm:h-96 lg:h-[420px] rounded-3xl bg-gradient-to-t ${destination.coverGradient} relative isolate overflow-hidden p-8 flex flex-col justify-end text-white shadow-xl`}>
          <CoverImage src={destination.coverUrl} alt={destination.name} sizes="(min-width: 1280px) 1200px, 100vw" priority />
          <div className="z-10 max-w-xl space-y-2">
            <span className="text-xs uppercase tracking-widest text-secondary-300 font-bold block">
              ✦ Purbalingga Memikat
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold leading-tight">
              {destination.summary}
            </h2>
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.6),transparent_70%)] pointer-events-none" />
        </div>

        {destination.images.length > 1 && (
          <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" aria-label="Galeri foto">
            {destination.images.map((img) => (
              <li key={img.id} className="space-y-1">
                <div className="relative h-32 rounded-xl overflow-hidden bg-stone-100">
                  <Image src={img.url} alt={img.caption || destination.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                </div>
                {img.caption && <p className="text-[11px] text-stone-500">{img.caption}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 3. MAIN CONTENT & SIDEBAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column (8 cols): Tabs, Description, Facilities, Reviews */}
          <div className="lg:col-span-8 space-y-8" data-reveal>
            {/* Tab Selector */}
            <div className="flex border-b border-stone-200 gap-6">
              {[
                { id: "info", label: "Informasi & Deskripsi" },
                { id: "fasilitas", label: "Fasilitas & Akses" },
                { id: "ulasan", label: `Ulasan (${destination.reviews.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`pb-3 text-sm font-heading font-semibold transition-colors border-b-2 cursor-pointer ${
                    activeTab === tab.id
                      ? "border-secondary-500 text-primary-900"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: INFO & DESCRIPTION */}
            {activeTab === "info" && (
              <div className="space-y-6">
                <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed font-body text-sm sm:text-base space-y-4">
                  {destination.description.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {/* Best visiting time callout */}
                <div className="bg-primary-50 border border-primary-200/80 rounded-2xl p-5 flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-heading font-bold text-primary-900">
                      Rekomendasi Waktu Kunjungan:
                    </p>
                    <p className="text-primary-800 mt-0.5">{destination.bestVisitingTime}</p>
                  </div>
                </div>

                {/* Accessibility */}
                <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-2">
                  <h3 className="font-heading font-semibold text-sm text-stone-900">
                    Aksesibilitas & Rute Transportasi
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-body">
                    {destination.accessibility}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: FASILITAS */}
            {activeTab === "fasilitas" && (
              <div className="space-y-6">
                <h3 className="font-editorial text-2xl font-bold text-stone-900">
                  Fasilitas Wisata
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {destination.facilities.map((fac, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-800 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: ULASAN PENGUNJUNG */}
            {activeTab === "ulasan" && (
              <div className="space-y-8">
                {/* List of Reviews */}
                <div className="space-y-4">
                  <h3 className="font-editorial text-2xl font-bold text-stone-900">
                    Ulasan Pengunjung Terverifikasi
                  </h3>

                  {destination.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-heading font-bold text-sm text-stone-900">{rev.author}</p>
                          <p className="text-[11px] text-stone-400">{rev.date}</p>
                        </div>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed font-body">
                        &quot;{rev.comment}&quot;
                      </p>
                    </div>
                  ))}
                </div>

                {/* Review Submission Form */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-secondary-500" />
                    <h4 className="font-heading font-bold text-base text-stone-900">
                      Tulis Ulasan Anda
                    </h4>
                  </div>

                  {reviewSubmitted ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Terima kasih atas ulasan Anda!</p>
                        <p>Ulasan Anda telah tersimpan dan akan dimoderasi oleh admin CMS sebelum ditampilkan ke publik.</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      {reviewError && (
                        <p className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">{reviewError}</p>
                      )}
                      <div>
                        <label htmlFor="input-reviewer-name" className="block text-xs font-semibold text-stone-700 mb-1">
                          Nama Anda
                        </label>
                        <input
                          id="input-reviewer-name"
                          type="text"
                          required
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder="Masukkan nama lengkap..."
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="select-reviewer-rating" className="block text-xs font-semibold text-stone-700 mb-1">
                          Rating Pengalaman
                        </label>
                        <select
                          id="select-reviewer-rating"
                          value={reviewerRating}
                          onChange={(e) => setReviewerRating(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-primary-500"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 - Luar Biasa)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 - Sangat Bagus)</option>
                          <option value={3}>⭐⭐⭐ (3 - Cukup Baik)</option>
                          <option value={2}>⭐⭐ (2 - Kurang)</option>
                          <option value={1}>⭐ (1 - Sangat Kurang)</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="textarea-reviewer-comment" className="block text-xs font-semibold text-stone-700 mb-1">
                          Ulasan Pengalaman
                        </label>
                        <textarea
                          id="textarea-reviewer-comment"
                          rows={3}
                          required
                          value={reviewerComment}
                          onChange={(e) => setReviewerComment(e.target.value)}
                          placeholder="Ceritakan pengalaman Anda berkunjung ke sini..."
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-stone-400 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Dimoderasi sebelum tayang
                        </span>
                        <Button type="submit" size="sm" variant="secondary" disabled={reviewPending}>
                          <Send className="w-3.5 h-3.5 mr-1" />
                          {reviewPending ? "Mengirim..." : "Kirim Ulasan"}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Sticky Info Card, Ticket, Contact */}
          <div className="lg:col-span-4 space-y-6" data-reveal="right">
            {/* Ticket Card */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-md space-y-5 sticky top-24">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <Ticket className="w-5 h-5 text-secondary-500" />
                <h3 className="font-heading font-bold text-base text-stone-900">
                  Informasi Tiket Masuk
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-xs text-stone-600 font-medium">Hari Kerja (Weekday)</span>
                  <span className="font-bold text-sm text-primary-900">
                    {formatRupiah(destination.ticketWeekday)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary-50/50 border border-secondary-200/60">
                  <span className="text-xs text-stone-700 font-medium">Akhir Pekan (Weekend)</span>
                  <span className="font-bold text-sm text-secondary-700">
                    {formatRupiah(destination.ticketWeekend)}
                  </span>
                </div>
              </div>

              {/* Contact Manager */}
              <div className="pt-2 border-t border-stone-100 space-y-3 text-xs">
                <div>
                  <p className="font-semibold text-stone-800">Pengelola Resmi:</p>
                  <p className="text-stone-500">{destination.contactManager}</p>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Kontak Reservasi / Info:</p>
                  <p className="text-primary-700 font-bold flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{destination.contactPhone}</span>
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Alamat Lengkap:</p>
                  <p className="text-stone-500 leading-relaxed mt-0.5">{destination.address}</p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://maps.google.com/?q=${destination.latitude},${destination.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-primary-800 hover:bg-primary-900 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-secondary-400" />
                  <span>Petunjuk Arah (Google Maps)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NEARBY RECOMMENDATIONS */}
      {nearby.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
          <div className="border-t border-stone-200 pt-8 flex items-center justify-between">
            <div>
              <h3 className="font-editorial text-2xl font-bold text-stone-900">
                Destinasi Terkait di Sekitar
              </h3>
              <p className="text-xs text-stone-500">
                Objek wisata terdekat di kawasan {destination.district} dan sekitarnya.
              </p>
            </div>
            <Link
              href="/destinasi"
              className="text-xs font-semibold text-primary-700 hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {nearby.map((item) => (
              <Link
                key={item.id}
                href={`/destinasi/${item.slug}`}
                className="group bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md hover:border-primary-500 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <Badge variant="primary" className="text-[10px]">
                    {item.categoryLabel}
                  </Badge>
                  <h4 className="font-heading font-bold text-sm text-stone-900 group-hover:text-primary-800 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs mt-3">
                  <span className="font-bold text-primary-800">
                    {formatRupiah(item.ticketWeekday)}
                  </span>
                  <span className="text-secondary-600 font-semibold group-hover:underline">
                    Lihat &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
