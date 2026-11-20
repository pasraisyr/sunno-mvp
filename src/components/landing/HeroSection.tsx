import { ArrowRight, Coins, ShieldCheck, Users } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Lencana Atas */}
          {/* <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-primary sm:text-sm">
            <span>🚀 Fasa 1 Kini Dibuka Untuk Peniaga & Pengguna Tempatan</span>
          </div> */}

          {/* Tajuk Utama (Ikut Checklist Phase 1) */}
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:leading-tight">
            SUNNO —{" "}
            <span className="text-primary">
              Digital Ecosystem for Local Businesses
            </span>
          </h1>

          {/* Sub-tajuk Penerangan */}
          <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
            Platform ekosistem digital tempatan yang menghubungkan{" "}
            <strong className="text-slate-900">Peniaga (Merchants)</strong>,{" "}
            <strong className="text-slate-900">Pengguna (Consumers)</strong>,{" "}
            <strong className="text-slate-900">Ganjaran Token</strong>, dan{" "}
            <strong className="text-slate-900">Rangkaian Komisen 3-Tier</strong>{" "}
            dalam satu sistem bersepadu.
          </p>

          {/* Butang Utama (Mobile-First: atas-bawah di telefon, kiri-kanan di laptop) */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="#pioneer-offer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-blue-900 sm:w-auto"
            >
              Daftar Pioneer Merchant (RM512)
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#what-is-sunno"
              className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Fahami Ekosistem Sunno
            </a>
          </div>
        </div>

        {/* 3 Kad Sorotan Pantas di Bawah Hero */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Ganjaran RM1 = 1 Token</h3>
              <p className="mt-1 text-sm text-slate-600">
                Setiap RM1.00 perbelanjaan tunai memberi pengguna 1 Token di dalam lejar khas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Komisen Rangkaian 3-Tier</h3>
              <p className="mt-1 text-sm text-slate-600">
                Agihan telus L1 (50%), L2 (15%), dan L3 (12.5%) daripada tabung komisen.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Bayaran Selamat CHIP</h3>
              <p className="mt-1 text-slate-600 text-sm">
                Transaksi FPX & Kad disahkan secara masa nyata dengan lejar berasingan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}