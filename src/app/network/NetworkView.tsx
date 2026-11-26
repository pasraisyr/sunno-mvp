"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Copy,
  Check,
  Share2,
  DollarSign,
  TrendingUp,
  Store,
  ArrowLeft,
  Calendar,
  Award,
  AlertCircle,
} from "lucide-react";
import type { NetworkDashboardViewProps } from "./types";

export function NetworkView({
  profile,
  isUserRestricted = false,
  referralLink,
  referralCode,
  totalCommissionsRm = 0,
  unpaidCommissionsRm = 0,
  paidCommissionsRm = 0,
  l1Count = 0,
  l2Count = 0,
  members = [],
  commissions = [],
}: NetworkDashboardViewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "commissions" | "formula">("members");
  const [tierFilter, setTierFilter] = useState<"ALL" | "L1" | "L2">("ALL");

  function handleCopy() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const totalDownlines = l1Count + l2Count;

  const filteredMembers =
    tierFilter === "ALL"
      ? members
      : members.filter((m) => m.tier === tierFilter);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header Rangkaian */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/marketplace"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition"
              title="Kembali ke Marketplace"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <Store className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-primary">
                MORRA<span className="text-slate-900">.ASIA</span>
              </span>
              <span className="ml-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700">
                Rangkaian 2-Level
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/wallet"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Dompet Token
            </Link>
            <Link
              href="/marketplace"
              className="rounded-lg bg-primary px-3.5 py-1.5 font-bold text-white hover:bg-blue-900 transition"
            >
              Marketplace
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Banner Sekatan untuk USER biasa mengikut polisi RBAC MORRA Fasa 1 */}
        {isUserRestricted && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <h3 className="font-bold text-sm">Akses Rangkaian Terhad (Akaun Pengguna)</h3>
                <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                  Mengikut polisi RBAC MORRA Fasa 1, akaun <strong>USER (Pengguna)</strong> menumpukan kepada pembelian dan penebusan diskaun Token dan tidak mempunyai hak membina downline komisen. Untuk menikmati komisen rujukan 2-Level, anda boleh mendaftar sebagai <strong>Agen Promoter</strong> atau <strong>Merchant</strong>.
                </p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center rounded-lg bg-white border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
                  >
                    Beli-Belah di Marketplace
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Banner Pautan Referral Ahli */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-primary to-blue-800 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100">
                <Share2 className="h-3.5 w-3.5" />
                Pautan Rujukan Rasmi Anda
              </div>
              <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
                Jemput Rakan & Kembangkan Rangkaian 2-Level
              </h1>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                Setiap transaksi yang layak menjana perkongsian komisen daripada Fi Platform 5% MORRA.
              </p>

              {/* Kotak Pautan & Butang Salin */}
              <div className="mt-5 flex max-w-lg flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center rounded-xl bg-white/10 px-3.5 py-2.5 text-xs font-mono text-white backdrop-blur-xs border border-white/20 truncate">
                  <span className="truncate">{referralLink}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-primary shadow-sm hover:bg-blue-50 transition shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Berjaya Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Pautan</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs border border-white/10 text-center sm:text-right">
              <span className="text-[11px] text-blue-200">Kod Rujukan Anda:</span>
              <p className="mt-0.5 text-xl font-extrabold tracking-widest text-white">
                {referralCode}
              </p>
              <p className="mt-1 text-[10px] text-blue-200">
                {profile?.full_name || "Ahli MORRA"} ({profile?.role || "USER"})
              </p>
            </div>
          </div>
        </div>

        {/* 3 Kad Ringkasan Statistik Rangkaian & Komisen */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Jumlah Komisen Terkumpul</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-emerald-600">
              RM {totalCommissionsRm.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Dibayar: RM {paidCommissionsRm.toFixed(2)} | Belum Dituntut: RM {unpaidCommissionsRm.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Jumlah Ahli Rangkaian</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-primary">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-primary">
              {totalDownlines} Orang
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Aras L1: {l1Count} • Aras L2: {l2Count}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Struktur Model</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-purple-700">
              2-Level MORRA
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Berasaskan Fi Platform 5%
            </p>
          </div>
        </div>

        {/* Tab Navigasi */}
        <div className="mt-8 flex gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === "members"
                ? "bg-primary text-white"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Users className="h-4 w-4" />
            Senarai Ahli ({members.length})
          </button>
          <button
            onClick={() => setActiveTab("commissions")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === "commissions"
                ? "bg-primary text-white"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Penyata Komisen ({commissions.length})
          </button>
          <button
            onClick={() => setActiveTab("formula")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === "formula"
                ? "bg-primary text-white"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Award className="h-4 w-4" />
            Formula Agihan 2-Level (Fi 5%)
          </button>
        </div>

        {/* KANDUNGAN TAB 1: SENARAI AHLI RANGKAIAN */}
        {activeTab === "members" && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            {/* Butang Tapis Tier */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Salasilah Downline</h3>
                <p className="text-xs text-slate-500">
                  Ahli yang mendaftar melalui pautan anda (L1) dan tajaan mereka (L2)
                </p>
              </div>

              <div className="flex gap-1.5">
                {(["ALL", "L1", "L2"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTierFilter(t)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      tierFilter === t
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t === "ALL" ? "Semua Aras" : `Aras ${t}`}
                  </button>
                ))}
              </div>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400">
                Tiada ahli dijumpai untuk paparan ini. Kongsi pautan rujukan anda sekarang!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredMembers.map((m) => {
                  const date = new Date(m.createdAt);

                  return (
                    <div
                      key={m.userId}
                      className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                              m.tier === "L1"
                                ? "bg-blue-100 text-primary"
                                : "bg-indigo-100 text-indigo-700"
                            }`}
                          >
                            {m.tier}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {m.fullName}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            {m.role}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          Tel: {m.phoneNumber || "Tidak ditetapkan"}
                        </p>
                      </div>

                      <div className="text-right text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          Daftar:{" "}
                          {date.toLocaleDateString("ms-MY", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* KANDUNGAN TAB 2: PENYATA KOMISEN */}
        {activeTab === "commissions" && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm">Sejarah Komisen Transaksi</h3>
            <p className="text-xs text-slate-500 mb-4">
              Rekod pengkreditan komisen daripada pesanan ahli rangkaian anda
            </p>

            {commissions.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400">
                Belum ada transaksi komisen direkodkan.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {commissions.map((c) => {
                  const date = new Date(c.createdAt);

                  return (
                    <div
                      key={c.id}
                      className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                              c.tier === "L1"
                                ? "bg-blue-100 text-primary"
                                : "bg-indigo-100 text-indigo-700"
                            }`}
                          >
                            {c.tier} ({c.percentage}%)
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            Pesanan #{c.orderId.slice(0, 8)}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                          Tarikh:{" "}
                          {date.toLocaleDateString("ms-MY", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-base font-extrabold text-emerald-600">
                            +RM {c.amountRm.toFixed(2)}
                          </p>
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                              c.isPaid
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {c.isPaid ? "Sudah Dibayar" : "Terkumpul"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* KANDUNGAN TAB 3: FORMULA AGIHAN 2-LEVEL (FI 5%) */}
        {activeTab === "formula" && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <Award className="h-5 w-5" />
              Formula Agihan Komisen 2-Level MORRA (Berasaskan Fi Platform 5%)
            </div>
            <p className="mt-1 text-xs text-slate-500">
              MORRA mengenakan Fi Platform 5% daripada nilai transaksi yang layak. Semua komisen diagihkan daripada nilai Fi 5% tersebut (Tiada Level 3):
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Senario A */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                  Senario A
                </span>
                <p className="mt-2 text-xs font-bold text-slate-900">
                  Agen memperkenalkan Merchant A
                </p>
                <div className="mt-3 space-y-1 text-xs text-slate-700">
                  <p>• <strong>Agen Ali (L1):</strong> 50% fi (2.5% jualan)</p>
                  <p>• <strong>MORRA HQ:</strong> 50% fi (2.5% jualan)</p>
                </div>
              </div>

              {/* Senario B */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4">
                <span className="rounded bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
                  Senario B
                </span>
                <p className="mt-2 text-xs font-bold text-slate-900">
                  Pelanggan Merchant A beli di Merchant A
                </p>
                <div className="mt-3 space-y-1 text-xs text-slate-700">
                  <p>• <strong>Merchant A (L1):</strong> 50% fi (2.5% jualan)</p>
                  <p>• <strong>Agen Ali (L2):</strong> 10% fi (0.5% jualan)</p>
                  <p>• <strong>MORRA HQ:</strong> 40% fi (2.0% jualan)</p>
                </div>
              </div>

              {/* Senario C */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-4">
                <span className="rounded bg-purple-600 px-2 py-0.5 text-xs font-bold text-white">
                  Senario C
                </span>
                <p className="mt-2 text-xs font-bold text-slate-900">
                  Pelanggan Merchant A beli di Merchant B
                </p>
                <div className="mt-3 space-y-1 text-xs text-slate-700">
                  <p>• <strong>Merchant A (L1):</strong> 50% fi (2.5% jualan)</p>
                  <p>• <strong>Merchant B:</strong> 0% (hasil jualan bersih)</p>
                  <p>• <strong>MORRA HQ:</strong> 50% fi (2.5% jualan)</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-100 p-4 text-xs text-slate-600 leading-relaxed">
              💡 <strong>Contoh Pengiraan Sebenar:</strong>
              <br />
              Pelanggan berbelanja RM100.00 tunai ➡️ Fi Platform MORRA 5% = <strong>RM 5.00</strong>.
              <br />
              • Dalam Senario B (Pelanggan Kedai A membeli di Kedai A yang diperkenalkan oleh Agen Ali):
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;Merchant A (L1): 50% x RM5.00 = <strong>RM 2.50</strong>
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;Agen Ali (L2): 10% x RM5.00 = <strong>RM 0.50</strong>
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;MORRA HQ: 40% x RM5.00 = <strong>RM 2.00</strong>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
