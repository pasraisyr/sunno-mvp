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
  Layers,
  Award,
} from "lucide-react";
import type { NetworkDashboardViewProps } from "./types";

export function NetworkView({
  profile,
  referralLink,
  referralCode,
  totalCommissionsRm = 0,
  unpaidCommissionsRm = 0,
  paidCommissionsRm = 0,
  l1Count = 0,
  l2Count = 0,
  l3Count = 0,
  members = [],
  commissions = [],
}: NetworkDashboardViewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "commissions" | "formula">("members");
  const [tierFilter, setTierFilter] = useState<"ALL" | "L1" | "L2" | "L3">("ALL");

  function handleCopy() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const totalDownlines = l1Count + l2Count + l3Count;

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
                SUNNO<span className="text-slate-900">.ASIA</span>
              </span>
              <span className="ml-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700">
                Rangkaian 3-Tier
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
        {/* Banner Pautan Referral Ahli */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-primary to-blue-800 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100">
                <Share2 className="h-3.5 w-3.5" />
                Pautan Rujukan Rasmi Anda
              </div>
              <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
                Jemput Ahli & Kembangkan Rangkaian
              </h1>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                Setiap pembelian ahli di bawah rangkaian 3-Tier (L1, L2, L3) memberi anda komisen automatik.
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
                Ahli: {profile?.full_name || "Rakan Sunno"}
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
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-emerald-600">
              RM {totalCommissionsRm.toFixed(2)}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Daripada semua pesanan rangkaian anda
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Baki Komisen Belum Dituntut</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-primary">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-primary">
              RM {unpaidCommissionsRm.toFixed(2)}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              (Sudah Dibayar: RM {paidCommissionsRm.toFixed(2)})
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Jumlah Ahli Rangkaian</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {totalDownlines} Ahli
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              L1: {l1Count} • L2: {l2Count} • L3: {l3Count}
            </p>
          </div>
        </div>

        {/* Tab Navigasi Rangkaian */}
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
            Carta Ahli Tajaan ({totalDownlines})
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
            Penyata Rekod Komisen ({commissions.length})
          </button>
          <button
            onClick={() => setActiveTab("formula")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === "formula"
                ? "bg-primary text-white"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Layers className="h-4 w-4" />
            Formula Agihan 3-Tier
          </button>
        </div>

        {/* KANDUNGAN TAB 1: CARTA AHLI TAJAAN */}
        {activeTab === "members" && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Senarai Ahli Di Bawah Rangkaian Anda</h3>
                <p className="text-xs text-slate-500">
                  Daftar ahli baru melalui pautan rujukan anda untuk membina komuniti
                </p>
              </div>

              {/* Penapis Tier */}
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 p-1">
                {(["ALL", "L1", "L2", "L3"] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTierFilter(tier)}
                    className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                      tierFilter === tier
                        ? "bg-white text-primary shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tier === "ALL" ? `Semua (${totalDownlines})` : `${tier}`}
                  </button>
                ))}
              </div>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400">
                Belum ada ahli di bawah {tierFilter === "ALL" ? "rangkaian anda" : `aras ${tierFilter}`}.
                <br />
                Kongsikan pautan rujukan anda di atas untuk mula menaja!
              </div>
            ) : (
              <div className="mt-4 divide-y divide-slate-100 overflow-x-auto">
                {filteredMembers.map((m) => {
                  const joinDate = new Date(m.createdAt);

                  return (
                    <div
                      key={`${m.userId}-${m.tier}`}
                      className="flex items-center justify-between py-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-extrabold text-white ${
                            m.tier === "L1"
                              ? "bg-blue-600"
                              : m.tier === "L2"
                              ? "bg-indigo-600"
                              : "bg-purple-600"
                          }`}
                        >
                          {m.tier}
                        </span>

                        <div>
                          <p className="text-sm font-bold text-slate-900">{m.fullName}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="capitalize text-slate-600 font-medium">
                              {m.role.toLowerCase()}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {joinDate.toLocaleDateString("ms-MY", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
                        Aras {m.tier}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* KANDUNGAN TAB 2: PENYATA REKOD KOMISEN */}
        {activeTab === "commissions" && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base">Penyata Rekod Komisen Rangkaian</h3>
            <p className="text-xs text-slate-500 mb-4">
              Komisen yang terhasil daripada setiap pesanan ahli rangkaian anda
            </p>

            {commissions.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400">
                Belum ada rekod komisen setakat ini. Komisen akan dijana secara automatik apabila downline anda membuat pembelian di Marketplace.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                {commissions.map((c) => {
                  const date = new Date(c.createdAt);

                  return (
                    <div
                      key={c.id}
                      className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 text-xs font-extrabold text-white ${
                              c.tier === "L1"
                                ? "bg-blue-600"
                                : c.tier === "L2"
                                ? "bg-indigo-600"
                                : "bg-purple-600"
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
                            {c.isPaid ? "Sudah Dibayar" : "Belum Dituntut"}
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

        {/* KANDUNGAN TAB 3: FORMULA AGIHAN 3-TIER */}
        {activeTab === "formula" && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <Award className="h-5 w-5" />
              Formula Agihan Tabung Komisen (Commission Pool)
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Setiap perbelanjaan tunai ahli di Sunno.asia memperuntukkan tabung komisen (10%) yang diagihkan mengikut formula rasmi berikut:
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                  L1 (Direct Sponsor)
                </span>
                <p className="mt-3 text-3xl font-extrabold text-primary">50.0%</p>
                <p className="mt-1 text-xs text-slate-600">
                  Daripada Commission Pool untuk penaja yang memperkenalkan ahli secara terus.
                </p>
              </div>

              <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4">
                <span className="rounded bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
                  L2 (Sponsor L1)
                </span>
                <p className="mt-3 text-3xl font-extrabold text-indigo-700">15.0%</p>
                <p className="mt-1 text-xs text-slate-600">
                  Daripada Commission Pool untuk penaja di aras kedua rangkaian.
                </p>
              </div>

              <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-4">
                <span className="rounded bg-purple-600 px-2 py-0.5 text-xs font-bold text-white">
                  L3 (Sponsor L2)
                </span>
                <p className="mt-3 text-3xl font-extrabold text-purple-700">12.5%</p>
                <p className="mt-1 text-xs text-slate-600">
                  Daripada Commission Pool untuk penaja di aras ketiga rangkaian.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="rounded bg-slate-700 px-2 py-0.5 text-xs font-bold text-white">
                  Syarikat (Sunno)
                </span>
                <p className="mt-3 text-3xl font-extrabold text-slate-800">22.5%</p>
                <p className="mt-1 text-xs text-slate-600">
                  Kos operasi, keselamatan lejar, dan pembangunan berterusan platform Sunno.asia.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-100 p-4 text-xs text-slate-600 leading-relaxed">
              💡 <strong>Contoh Pengiraan Sebenar:</strong>
              <br />
              Jika ahli L1 anda berbelanja RM100.00 tunai ➡️ Commission Pool ialah RM10.00 (10%).
              <br />
              • Anda (L1) akan menerima: <strong>50% x RM10.00 = RM 5.00</strong>.
              <br />
              • Penaja anda (L2) akan menerima: <strong>15% x RM10.00 = RM 1.50</strong>.
              <br />
              • Penaja di atasnya (L3) akan menerima: <strong>12.5% x RM10.00 = RM 1.25</strong>.
              <br />
              Komisen dimasukkan terus ke dalam penyata dan boleh dituntut ke akaun bank anda!
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

