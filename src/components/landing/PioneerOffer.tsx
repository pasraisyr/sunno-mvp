import { Check, Crown, ArrowRight } from "lucide-react";

const pioneerPerks = [
  "Akses penuh Kedai Digital Sunno.asia & papan pemuka (Merchant Dashboard)",
  "Integrasi pembayaran automatik FPX & Kad melalui CHIP",
  "Lencana eksklusif 'Pioneer Merchant' di direktori utama Sunno",
  "Akses kepada ekosistem kesetiaan Token & rangkaian pemasaran 3-Tier",
  "Sokongan teknikal & latihan onboarding keutamaan Fasa 1",
];

export function PioneerOffer() {
  return (
    <section id="pioneer-offer" className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border-2 border-primary bg-white shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Bahagian Kiri: Penerangan Tawaran */}
            <div className="p-6 sm:p-10 md:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <Crown className="h-4 w-4" />
                 Pioneer Merchant Offer
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Jadilah Peniaga Perintis (Pioneer Merchant) Sunno.asia
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Rebut peluang terawal mendigitalkan perniagaan anda bersama ekosistem
                Sunno dengan yuran penyediaan sekali sahaja.
              </p>

              <ul className="mt-6 space-y-3">
                {pioneerPerks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-primary">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bahagian Kanan: Kotak Harga RM512 */}
            <div className="flex flex-col justify-center bg-primary p-6 text-center text-white sm:p-10 md:col-span-5">
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-200">
                Pakej Setup Fee Sekali Bayar
              </span>
              <div className="mt-3 flex items-baseline justify-center gap-1">
                <span className="text-xl font-bold">RM</span>
                <span className="text-5xl font-extrabold tracking-tight">512</span>
              </div>
              <p className="mt-2 text-xs text-blue-100">
                Pengaktifan akaun segera selepas pengesahan pembayaran CHIP
              </p>

              <a
                href="#cta-join"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-primary shadow-md transition hover:bg-blue-50"
              >
                Daftar Pioneer Merchant
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}