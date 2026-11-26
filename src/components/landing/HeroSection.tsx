import { ArrowRight, Coins, ShieldCheck, Users } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Tajuk Utama */}
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:leading-tight">
            MORRA —{" "}
            <span className="text-primary">
              Digital Ecosystem for Local Businesses
            </span>
          </h1>

          {/* Sub-tajuk Penerangan */}
          <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
            Platform ekosistem digital tempatan yang menghubungkan{" "}
            <strong className="text-slate-900">Peniaga (Merchants)</strong>,{" "}
            <strong className="text-slate-900">Agen Promoter</strong>, dan{" "}
            <strong className="text-slate-900">Pengguna (Users)</strong> melalui konsep{" "}
            <strong className="text-slate-900">&ldquo;Belanja &rarr; Kumpul Token &rarr; Tebus Diskaun&rdquo;</strong>{" "}
            serta enjin komisen 2-Level telus berasaskan Fi Platform 5%.
          </p>

          {/* Butang Utama */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="#pioneer-offer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-blue-900 sm:w-auto"
            >
              Daftar Pioneer Merchant (RM512)
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#what-is-morra"
              className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Fahami Ekosistem MORRA
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
              <h3 className="font-bold text-slate-900">Kumpul & Tebus Token</h3>
              <p className="mt-1 text-sm text-slate-600">
                Setiap RM1.00 perbelanjaan tunai memberi pengguna 1 Token dalam lejar khas untuk potongan diskaun belian.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Komisen 2-Level (Fi 5%)</h3>
              <p className="mt-1 text-sm text-slate-600">
                Agihan komisen telus berasaskan Fi Platform 5% tanpa sistem piramid atau aras L3.
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
                Transaksi FPX & Kad disahkan secara masa nyata dengan pengasingan lejar settlement yang telus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
