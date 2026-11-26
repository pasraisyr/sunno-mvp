"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Store,
  Users,
  Coins,
  DollarSign,
  Download,
  CheckCircle2,
  XCircle,
  Settings,
  ArrowLeft,
  Calendar,
  Layers,
} from "lucide-react";
import {
  toggleMerchantStatusAction,
  updateUserRoleAction,
  claimAdminRoleAction,
} from "./actions";
import type { AdminDashboardViewProps } from "./types";

export function AdminDashboardView({
  isAdmin,
  stats,
  merchants = [],
  users = [],
  orders = [],
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "merchants" | "users" | "settings">("overview");
  const [claiming, setClaiming] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fungsi Naik Taraf Akaun Sendiri Kepada ADMIN (Bagi Dev Tempatan)
  async function handleClaimAdmin() {
    setClaiming(true);
    await claimAdminRoleAction();
    setClaiming(false);
    window.location.reload();
  }

  // Fungsi Luluskan / Nyahaktifkan Kedai
  async function handleToggleMerchant(id: string, currentStatus: boolean) {
    setUpdatingId(id);
    await toggleMerchantStatusAction(id, !currentStatus);
    setUpdatingId(null);
  }

  // Fungsi Ubah Peranan Pengguna (Role: USER, AGEN_PROMOTER, MERCHANT, ADMIN)
  async function handleChangeRole(
    userId: string,
    newRole: "USER" | "AGEN_PROMOTER" | "MERCHANT" | "ADMIN"
  ) {
    setUpdatingId(userId);
    await updateUserRoleAction(userId, newRole);
    setUpdatingId(null);
  }

  // Fungsi Eksport Laporan Pesanan ke CSV (Format Microsoft Excel)
  function exportOrdersToCSV() {
    if (orders.length === 0) {
      alert("Tiada rekod pesanan untuk dieksport.");
      return;
    }

    const headers = [
      "No. Pesanan",
      "Nama Pelanggan",
      "Kedai",
      "Jumlah Bil (RM)",
      "Token Ditebus",
      "Tunai Dibayar (RM)",
      "Hak Peniaga (RM)",
      "Fi MORRA 5% (RM)",
      "Caj CHIP 1% (RM)",
      "Status",
      "Tarikh",
    ];

    const rows = orders.map((o) => [
      `"${o.id}"`,
      `"${o.customerName}"`,
      `"${o.shopName}"`,
      o.totalAmountRm.toFixed(2),
      o.tokensUsed,
      o.cashPaidRm.toFixed(2),
      o.merchantNetRm.toFixed(2),
      o.platformFeeRm.toFixed(2),
      o.chipGatewayFeeRm.toFixed(2),
      `"${o.status}"`,
      `"${new Date(o.createdAt).toLocaleString("ms-MY")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `morra_laporan_pesanan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-lg sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">Akses Pentadbir Terhad</h2>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Akaun anda tidak mempunyai kelulusan peranan <strong>ADMIN</strong> untuk membuka Pusat Kawalan Superadmin MORRA.
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={handleClaimAdmin}
              disabled={claiming}
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {claiming ? "Menaik taraf..." : "⚡ Tetapkan Akaun Ini Sebagai Admin (Dev Test)"}
            </button>

            <Link href="/" className="text-xs text-slate-500 hover:underline">
              Kembali ke Laman Utama
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header Admin */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition"
              title="Laman Utama"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-primary">
                MORRA<span className="text-slate-900">.ASIA</span>
              </span>
              <span className="ml-1 rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700">
                Admin Panel
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/marketplace"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Marketplace
            </Link>
            <Link
              href="/merchant/dashboard"
              className="rounded-lg bg-primary px-3 py-1.5 font-bold text-white hover:bg-blue-900 transition"
            >
              Portal Merchant
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Banner Admin Utama - Ringkasan Kewangan HQ */}
        <div className="mb-8 rounded-3xl bg-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Pusat Kawalan Superadmin MORRA (HQ)
              </span>
              <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                Pendapatan HQ & Pemantauan Ekosistem
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                Pantau kutipan yuran pendaftaran Pioneer RM512, bahagian bersih Fi Platform MORRA 5%, dan status kelulusan peniaga.
              </p>
            </div>

            {/* Kotak Highlight Hasil Bersih HQ */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="rounded-2xl bg-white/10 p-4 border border-white/15 min-w-[220px]">
                <span className="text-[11px] font-medium text-slate-300">
                  Jumlah Pendapatan Bersih HQ
                </span>
                <p className="mt-0.5 text-2xl font-extrabold text-emerald-400">
                  RM {stats.totalHqRevenueRm.toFixed(2)}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  Pioneer: RM {stats.totalPioneerFeesRm.toFixed(2)} + Fi MORRA HQ: RM {stats.totalCompanyShareRm.toFixed(2)}
                </p>
              </div>

              <button
                onClick={exportOrdersToCSV}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white hover:bg-blue-900 transition shadow-sm shrink-0 self-start sm:self-auto"
              >
                <Download className="h-4 w-4" />
                Eksport Laporan CSV
              </button>
            </div>
          </div>
        </div>

        {/* 6 Kad Ringkasan Terperinci */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {/* 1. Yuran Pioneer (RM512) */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-800">Yuran Pioneer RM512</span>
            <p className="mt-1 text-xl font-extrabold text-emerald-700">
              RM {stats.totalPioneerFeesRm.toFixed(2)}
            </p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Kutipan Pendaftaran</p>
          </div>

          {/* 2. Hasil Fi MORRA 5% */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
            <span className="text-[11px] font-bold text-blue-800">Hasil Fi Platform</span>
            <p className="mt-1 text-xl font-extrabold text-blue-700">
              RM {stats.totalCompanyShareRm.toFixed(2)}
            </p>
            <p className="text-[10px] text-blue-600 mt-0.5">Bahagian Bersih HQ (5%)</p>
          </div>

          {/* 3. GMV Pasaran (Jualan Peniaga) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">GMV Pasaran (Jualan)</span>
            <p className="mt-1 text-xl font-extrabold text-slate-900">
              RM {stats.totalGmvRm.toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Jualan Kasar Kedai</p>
          </div>

          {/* 4. Kedai Aktif */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">Kedai Pioneer Aktif</span>
            <p className="mt-1 text-xl font-extrabold text-slate-900">
              {stats.totalActiveMerchants}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Peniaga Sah</p>
          </div>

          {/* 5. Jumlah Pengguna */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">Jumlah Ahli</span>
            <p className="mt-1 text-xl font-extrabold text-slate-900">
              {stats.totalUsersCount}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">User, Agen & Merchant</p>
          </div>

          {/* 6. Token Dikeluarkan */}
          <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-purple-900">Token Dikeluarkan</span>
            <p className="mt-1 text-xl font-extrabold text-purple-700">
              {stats.totalTokensIssued} T
            </p>
            <p className="text-[10px] text-purple-600 mt-0.5">Ganjaran Belanja</p>
          </div>
        </div>

        {/* Tab Navigasi Admin */}
        <div className="flex gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === "overview"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Semua Pesanan ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("merchants")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === "merchants"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Store className="h-4 w-4" />
            Pengesahan Merchant ({merchants.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === "users"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Users className="h-4 w-4" />
            Pengguna & Rangkaian ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === "settings"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Settings className="h-4 w-4" />
            Tetapan Sistem
          </button>
        </div>

        {/* TAB 1: SEMUA PESANAN & TRANSAKSI */}
        {activeTab === "overview" && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Sejarah Transaksi Pesanan E-Commerce</h3>
                <p className="text-xs text-slate-500">
                  Semua transaksi belian merentas kedai dan pengguna MORRA
                </p>
              </div>

              <button
                onClick={exportOrdersToCSV}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                Muat Turun CSV
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400">
                Belum ada pesanan direkodkan.
              </div>
            ) : (
              <div className="mt-4 divide-y divide-slate-100 overflow-x-auto">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          #{o.id.slice(0, 8)}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                            o.status === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : o.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {o.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Pelanggan: <strong>{o.customerName}</strong> • Kedai: <strong>{o.shopName}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-extrabold text-slate-900">
                        RM {o.totalAmountRm.toFixed(2)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Tunai: RM {o.cashPaidRm.toFixed(2)} • Token: {o.tokensUsed} T
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Peniaga: RM {o.merchantNetRm.toFixed(2)} | Fi MORRA 5%: RM {o.platformFeeRm.toFixed(2)} | CHIP 1%: RM {o.chipGatewayFeeRm.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PENGESAHAN & KAWALAN MERCHANT */}
        {activeTab === "merchants" && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base">Senarai & Pengesahan Peniaga (Merchants)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Kawal status pengaktifan kedai untuk paparan umum di Marketplace MORRA
            </p>

            {merchants.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400">
                Belum ada peniaga yang berdaftar.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                {merchants.map((m) => {
                  const isPaid = m.pioneerPaymentStatus === "PAID" || m.isActive;
                  return (
                    <div
                      key={m.id}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{m.shopName}</h4>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              m.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {m.isActive ? "Kedai Aktif" : "Belum Aktif (Pending)"}
                          </span>

                          {/* Status Bayaran Pakej Pioneer RM512 (Single Source of Truth) */}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                              isPaid
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : m.pioneerPaymentStatus === "PENDING"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {isPaid
                              ? "Pioneer RM512: LUNAS"
                              : m.pioneerPaymentStatus === "PENDING"
                              ? "Pioneer RM512: MENUNGGU BAYARAN"
                              : "Pioneer RM512: BELUM BAYAR"}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          Pemilik: <strong>{m.ownerName}</strong> ({m.ownerPhone || "Tiada No. Tel"}) • Slug: <code>morra.asia/{m.slug}</code>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleMerchant(m.id, m.isActive)}
                          disabled={updatingId === m.id}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                            m.isActive
                              ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          {m.isActive ? (
                            <>
                              <XCircle className="h-3.5 w-3.5" />
                              Nyahaktifkan
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Luluskan (Aktifkan)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PENGURUSAN PENGGUNA & RANGKAIAN */}
        {activeTab === "users" && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base">Senarai Pengguna & Penaja Rangkaian</h3>
            <p className="text-xs text-slate-500 mb-4">
              Urus peranan pengguna (USER, AGEN_PROMOTER, MERCHANT, ADMIN)
            </p>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {users.map((u) => {
                const date = new Date(u.createdAt);

                return (
                  <div
                    key={u.id}
                    className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{u.fullName}</span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            u.role === "ADMIN"
                              ? "bg-red-100 text-red-800"
                              : u.role === "AGEN_PROMOTER"
                              ? "bg-purple-100 text-purple-800"
                              : u.role === "MERCHANT"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        Tel: {u.phoneNumber || "-"} • Penaja: <strong>{u.sponsorName || "Tiada (Daftar Terus)"}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {date.toLocaleDateString("ms-MY", { day: "numeric", month: "short", year: "numeric" })}
                      </span>

                      {/* Tukar Role Pantas */}
                      <select
                        value={u.role}
                        disabled={updatingId === u.id}
                        onChange={(e) =>
                          handleChangeRole(
                            u.id,
                            e.target.value as "USER" | "AGEN_PROMOTER" | "MERCHANT" | "ADMIN"
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 outline-none"
                      >
                        <option value="USER">USER</option>
                        <option value="AGEN_PROMOTER">AGEN_PROMOTER</option>
                        <option value="MERCHANT">MERCHANT</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: KAWALAN TETAPAN SISTEM */}
        {activeTab === "settings" && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <Settings className="h-5 w-5" />
              Tetapan Dasar Ekosistem MORRA.ASIA Fasa 1
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Parameter rasmi pengiraan lejar token, komisen 2-Level berasaskan Fi Platform 5%, dan caj gateway
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  <Coins className="h-4 w-4" /> Syarat & Ganjaran Token
                </span>
                <p className="mt-2 text-sm font-extrabold text-slate-900">
                  RM 1.00 Tunai = 1 Token
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Konsep rasmi: Belanja → Kumpul Token → Tebus Diskaun semasa checkout. Token disimpan dalam lejar khas berasingan.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
                  <Layers className="h-4 w-4" /> Fi Platform MORRA & Komisen
                </span>
                <p className="mt-2 text-sm font-extrabold text-slate-900">
                  5.0% Fi Platform (Tiada L3)
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Agihan rasmi: Senario A (Agen L1 50%, MORRA 50%), Senario B (Merchant L1 50%, Agen L2 10%, MORRA 40%), Senario C (Merchant L1 50%, MORRA 50%).
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <DollarSign className="h-4 w-4" /> Caj CHIP Gateway
                </span>
                <p className="mt-2 text-sm font-extrabold text-slate-900">
                  1.0% (Min RM0.15, Max RM1.50)
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Terpisah sepenuhnya daripada Fi 5% MORRA. Jumlah potongan asas ~6%, baki asas hak peniaga ~94%.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
              ℹ️ Parameter ini dikawal secara dinamik melalui jadual <code>system_configs</code> dan modul <code>src/lib/commission.ts</code> bagi memastikan ketelusan audit lejar.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
