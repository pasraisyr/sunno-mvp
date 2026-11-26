import { CheckCircle2, ShoppingBag, Store } from "lucide-react";

const merchantBenefits = [
  "Kedai digital sendiri (contoh: morra.asia/kedai-anda) siap dalam beberapa minit.",
  "Terima bayaran FPX & Kad secara automatik melalui integrasi CHIP.",
  "Kawal diskaun Token mengikut margin keuntungan kedai anda secara bebas.",
  "Tarik pelanggan baharu melalui jaringan Agen Promoter berdaftar MORRA.",
];

const customerBenefits = [
  "Kumpul 1 Token bagi setiap RM1.00 tunai yang dibelanjakan di Marketplace.",
  "Tebus Token untuk potongan diskaun belian seterusnya di kedai rakan niaga.",
  "Token disimpan selamat dalam lejar berasingan tanpa luput tempoh.",
  "Sokong perniagaan tempatan dengan transaksi yang disahkan selamat melalui CHIP.",
];

export function AboutAndBenefits() {
  return (
    <div className="space-y-20 py-16 md:py-24">
      {/* SEKSYEN 1: What is MORRA? */}
      <section id="what-is-morra" className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl bg-primary px-6 py-12 text-center text-white sm:px-12 md:py-16">
          <h2 className="mt-4 text-2xl font-extrabold sm:text-4xl">
            What is MORRA? — Ekosistem Digital Perniagaan Tempatan
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-blue-100 sm:text-lg">
            <strong>MORRA.ASIA</strong> ialah platform e-dagang dan kesetiaan komuniti
            yang direka khas untuk membantu usahawan tempatan mendigitalkan kedai mereka,
            memberi ganjaran <strong>Token</strong> kepada pembeli setiap kali berbelanja
            (Belanja → Kumpul Token → Tebus Diskaun),
            dan mengagihkan komisen telus berasaskan <strong>Fi Platform 5%</strong> melalui struktur 2-Level yang adil.
          </p>
        </div>
      </section>

      {/* SEKSYEN 2 & SEKSYEN 3: For Merchants & For Customers */}
      <section id="for-merchants" className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Seksyen 2: For Merchants */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
              <Store className="h-6 w-6" />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">
              Untuk Peniaga
            </p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">
              For Merchants (Kelebihan Peniaga)
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Tingkatkan jualan kedai anda dengan ekosistem digital tanpa kos tersembunyi.
            </p>
            <ul className="mt-6 space-y-3.5">
              {merchantBenefits.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Seksyen 3: For Customers */}
          <div
            id="for-customers"
            className="rounded-2xl border border-blue-200 bg-blue-50/40 p-6 sm:p-8"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">
              Untuk Pengguna
            </p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">
              For Customers (Kelebihan Pengguna)
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Berbelanja seperti biasa di kedai tempatan dan kumpul ganjaran diskaun berterusan.
            </p>
            <ul className="mt-6 space-y-3.5">
              {customerBenefits.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
