import { Coins, GitBranch } from "lucide-react";

const scenarios = [
  {
    name: "Senario A",
    title: "Agen memperkenalkan Merchant",
    desc: "Apabila merchant bertransaksi dengan mana-mana kedai berdaftar, Agen L1 menerima 50% daripada fi platform 5% (2.5% jualan).",
    split: "50% Agen | 50% MORRA",
  },
  {
    name: "Senario B",
    title: "Pelanggan Merchant A beli di Merchant A",
    desc: "Merchant A (L1) menerima 50%, Agen penaja Merchant A (L2) menerima 10%, dan MORRA menerima 40% daripada fi 5%.",
    split: "50% Kedai | 10% Agen | 40% MORRA",
  },
  {
    name: "Senario C",
    title: "Pelanggan Merchant A beli di Merchant B",
    desc: "Merchant A (L1 perujuk pelanggan) menerima 50%, Merchant B penjual menerima hasil jualan bersih, MORRA menerima 50% fi.",
    split: "50% Perujuk | 50% MORRA",
  },
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
              Sistem Lejar Token (Belanja → Kumpul → Tebus)
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Setiap perbelanjaan tunai yang sah di MORRA.ASIA memberi ganjaran{" "}
              <strong>1 Token untuk setiap RM1.00</strong>. Token direkodkan di dalam
              lejar khas yang berasingan sepenuhnya daripada wang tunai dan digunakan untuk diskaun pembelian seterusnya.
            </p>

            <div className="mt-6 space-y-3 rounded-xl bg-blue-50/60 p-4 text-sm text-slate-700">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <span className="font-medium">Kadar Ganjaran Rasmi</span>
                <span className="font-bold text-primary">RM1.00 Tunai = 1 Token</span>
              </div>
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <span className="font-medium">Masa Pengkreditan</span>
                <span className="font-bold text-slate-900">Automatik Selepas Status PAID</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Sifat Token</span>
                <span className="font-bold text-slate-900">Diskaun Sahaja (Bukan Wang Tunai)</span>
              </div>
            </div>
          </div>

          {/* SEKSYEN 7: Networking System Briefing */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-primary">
              <GitBranch className="h-6 w-6" />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">
              2-Level Commission Engine
            </p>
            <h3 className="mt-1 text-2xl font-extrabold text-slate-900">
              Komisen 2-Level (Fi Platform 5%)
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              MORRA mengenakan Fi Platform 5%. Semua komisen diagihkan secara telus daripada nilai fi 5% tersebut (Tiada Level 3):
            </p>

            <div className="mt-6 space-y-3">
              {scenarios.map((s) => (
                <div
                  key={s.name}
                  className="rounded-xl border border-slate-200 p-3.5 bg-white"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-primary">
                      {s.name}
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {s.split}
                    </span>
                  </div>
                  <h4 className="mt-1.5 text-xs font-bold text-slate-900">{s.title}</h4>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
