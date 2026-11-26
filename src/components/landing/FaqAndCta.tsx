const faqs = [
  {
    q: "Apakah beza antara Token MORRA dan wang tunai (RM)?",
    a: "Token MORRA ialah mata ganjaran kesetiaan yang direkodkan dalam lejar berasingan (RM1 dibelanjakan = 1 Token). Ia digunakan untuk penebusan diskaun semasa checkout dalam ekosistem MORRA dan tidak boleh dikeluarkan sebagai wang tunai.",
  },
  {
    q: "Bagaimana cara menjadi Pioneer Merchant?",
    a: "Anda hanya perlu mendaftar akaun peniaga dan melengkapkan yuran penyediaan sistem sekali bayar sebanyak RM512 melalui gerbang pembayaran CHIP. Kedai anda akan diaktifkan serta-merta.",
  },
  {
    q: "Bagaimana komisen 2-Level MORRA dikira?",
    a: "MORRA mengenakan Fi Platform 5% daripada nilai transaksi. Komisen diagihkan daripada tabung fi 5% tersebut mengikut 3 senario rasmi: Senario A (Agen L1 50%, MORRA 50%), Senario B (Merchant L1 50%, Agen L2 10%, MORRA 40%), dan Senario C (Merchant L1 50%, Penjual 0%, MORRA 50%). Tiada Level 3 dalam ekosistem MORRA.",
  },
  {
    q: "Adakah pembayaran di MORRA.ASIA selamat?",
    a: "Ya, semua transaksi diproses melalui CHIP Payment Gateway dengan pengesahan tandatangan keselamatan (Webhook Signature Verification) serta pengasingan lejar settlement yang telus.",
  },
];

export function FaqAndCta() {
  return (
    <div>
      {/* SEKSYEN 8: FAQ (Soalan Lazim) */}
      <section id="faq" className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              FAQ
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-4xl">
              Soalan Lazim (FAQ)
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            {faqs.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <h3 className="text-base font-bold text-slate-900">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEKSYEN 9: Call-To-Action (Daftar Merchant / Sertai MORRA) */}
      <section id="cta-join" className="bg-primary py-16 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
            Sertai Sekarang
          </p>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Bersedia Menyertai Ekosistem Digital MORRA.ASIA?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-blue-100">
            Daftar sebagai Pioneer Merchant untuk mengembangkan perniagaan anda, sertai sebagai Agen Promoter, atau kumpul Token sebagai pengguna hari ini.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/register?role=MERCHANT"
              className="w-full rounded-xl bg-white px-8 py-3.5 text-base font-bold text-primary shadow-md transition hover:bg-blue-50 sm:w-auto"
            >
              Daftar Sebagai Merchant
            </a>
            <a
              href="/register?role=AGEN_PROMOTER"
              className="w-full rounded-xl border border-white/40 bg-purple-700/60 px-8 py-3.5 text-base font-bold text-white transition hover:bg-purple-700 sm:w-auto"
            >
              Daftar Sebagai Agen Promoter
            </a>
            <a
              href="/register?role=USER"
              className="w-full rounded-xl border border-white/40 bg-blue-800/50 px-8 py-3.5 text-base font-bold text-white transition hover:bg-blue-800 sm:w-auto"
            >
              Sertai Sebagai Pengguna
            </a>
          </div>
        </div>
      </section>

      {/* Footer Ringkas */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} MORRA.ASIA — Digital Ecosystem for Local Businesses. Hak Cipta Terpelihara.
      </footer>
    </div>
  );
}
