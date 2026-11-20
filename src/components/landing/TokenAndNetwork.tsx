import { Coins, GitBranch } from "lucide-react";

const tiers = [
  { level: "L1 (Direct Sponsor)", percent: "50%", desc: "Penaja terus yang memperkenalkan pengguna/peniaga." },
  { level: "L2 (Sponsor of L1)", percent: "15%", desc: "Penaja aras kedua di dalam rangkaian." },
  { level: "L3 (Sponsor of L2)", percent: "12.5%", desc: "Penaja aras ketiga di dalam rangkaian." },
  { level: "Company Keep", percent: "22.5%", desc: "Kos operasi, penyelenggaraan sistem & pembangunan ekosistem." },
];

export function TokenAndNetwork() {
  return (
    <section id="token-network" className="border-t border-slate-200 bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* SEKSYEN 6: Token System Briefing */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-primary">
              <Coins className="h-6 w-6" />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">
               Token System Briefing
            </p>
            <h3 className="mt-1 text-2xl font-extrabold text-slate-900">
              Sistem Lejar Token Berasingan
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Setiap perbelanjaan tunai yang sah di Sunno.asia memberi ganjaran{" "}
              <strong>1 Token untuk setiap RM1.00</strong>. Token direkodkan di dalam
              lejar khas yang berasingan sepenuhnya daripada dompet tunai (Fiat).
            </p>

            <div className="mt-6 space-y-3 rounded-xl bg-blue-50/60 p-4 text-sm text-slate-700">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <span className="font-medium">Kadar Ganjaran Asas</span>
                <span className="font-bold text-primary">RM1.00 Tunai = 1 Token</span>
              </div>
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <span className="font-medium">Masa Pengkreditan</span>
                <span className="font-bold text-slate-900">Automatik Selepas Status PAID</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Pengasingan Akaun</span>
                <span className="font-bold text-slate-900">Lejar Token Khas (Bukan Tunai)</span>
              </div>
            </div>
          </div>

          {/* SEKSYEN 7: Networking System Briefing */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-primary">
              <GitBranch className="h-6 w-6" />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">
               Networking System Briefing
            </p>
            <h3 className="mt-1 text-2xl font-extrabold text-slate-900">
              Sistem Komisen Rangkaian 3-Tier
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Apabila transaksi selesai, tabung komisen (Commission Pool) diagihkan
              secara telus sehingga 3 aras rujukan:
            </p>

            <div className="mt-6 space-y-3">
              {tiers.map((t) => (
                <div
                  key={t.level}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.level}</p>
                    <p className="text-xs text-slate-500">{t.desc}</p>
                  </div>
                  <span className="rounded-lg bg-primary px-3 py-1 text-sm font-extrabold text-white">
                    {t.percent}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}