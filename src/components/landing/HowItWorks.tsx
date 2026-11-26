const steps = [
  {
    step: "01",
    title: "Peniaga Buka Kedai Digital",
    desc: "Peniaga mendaftar sebagai Pioneer Merchant dan menyenaraikan produk atau servis mereka di MORRA.ASIA.",
  },
  {
    step: "02",
    title: "Pengguna Berbelanja & Bayar",
    desc: "Pelanggan membuat pesanan dan membayar dengan selamat melalui FPX / Kad menggunakan gerbang pembayaran CHIP.",
  },
  {
    step: "03",
    title: "Kumpul Token (RM1 = 1 Token)",
    desc: "Sebaik sahaja bayaran disahkan (PAID), pelanggan menerima ganjaran Token secara automatik untuk ditebus pada pembelian seterusnya.",
  },
  {
    step: "04",
    title: "Agihan Komisen 2-Level (Fi 5%)",
    desc: "Sistem mengagihkan bahagian komisen daripada Fi Platform 5% kepada Agen Promoter dan Merchant mengikut senario transaksi rasmi.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Aliran Ekosistem
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-4xl">
            How MORRA Works (Visual Aliran Perniagaan)
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            4 langkah mudah bagaimana transaksi di MORRA.ASIA memberi manfaat kepada semua pihak.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div
              key={item.step}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-extrabold text-white">
                {item.step}
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
