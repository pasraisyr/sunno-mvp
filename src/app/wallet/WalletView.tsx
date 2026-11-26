"use client";

import Link from "next/link";
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Store,
  ShoppingBag,
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";
import type { WalletViewProps } from "./types";

export function WalletView({
  user,
  profile,
  currentBalance = 0,
  totalEarned = 0,
  totalRedeemed = 0,
  transactions = [],
}: WalletViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header Dompet */}
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
              <span className="ml-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-primary">
                Dompet Token
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/network"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Rangkaian 2-Level
            </Link>
            <Link
              href="/marketplace"
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-900 transition"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Marketplace</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Banner Kad Baki Utama */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-primary to-blue-800 p-6 text-white shadow-xl sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100">
                <Sparkles className="h-3.5 w-3.5" />
                Dompet Kesetiaan MORRA
              </div>
              <h1 className="mt-3 text-sm font-semibold text-blue-200">
                Baki Token Semasa:
              </h1>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight sm:text-6xl">
                  {currentBalance.toLocaleString()}
                </span>
                <span className="text-lg font-bold text-blue-200 sm:text-2xl">
                  Token
                </span>
              </div>
              <p className="mt-2 text-xs text-blue-100/90">
                Pemilik:{" "}
                <strong className="text-white">
                  {profile?.full_name || user?.email}
                </strong>{" "}
                • Boleh ditebus untuk potongan diskaun belian di Marketplace
              </p>
            </div>

            <div className="flex sm:flex-col gap-3">
              <Link
                href="/marketplace"
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-primary shadow-sm hover:bg-blue-50 transition"
              >
                <ShoppingBag className="h-4 w-4" />
                Tebus di Marketplace
              </Link>
            </div>
          </div>
        </div>

        {/* 2 Kad Statistik: Total Earned vs Total Redeemed */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Jumlah Token Diperoleh (Kumpul)
              </p>
              <p className="mt-0.5 text-2xl font-extrabold text-emerald-600">
                +{totalEarned.toLocaleString()} Token
              </p>
              <p className="text-[11px] text-slate-400">
                Ganjaran rasmi RM1 tunai = 1 Token
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ArrowUpRight className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Jumlah Token Ditebus (Diskaun)
              </p>
              <p className="mt-0.5 text-2xl font-extrabold text-amber-600">
                -{totalRedeemed.toLocaleString()} Token
              </p>
              <p className="text-[11px] text-slate-400">
                Digunakan untuk potongan harga pesanan
              </p>
            </div>
          </div>
        </div>

        {/* Bahagian Sejarah Transaksi Lejar */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-slate-900">
                Sejarah Transaksi Lejar Token
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {transactions.length} Rekod
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Belum ada sebarang transaksi token direkodkan.
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-100 overflow-x-auto">
              {transactions.map((tx) => {
                const date = new Date(tx.created_at);
                const isEarned = tx.type === "EARNED";

                return (
                  <div
                    key={tx.id}
                    className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isEarned
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {isEarned ? (
                          <ArrowDownLeft className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {tx.description ||
                            (isEarned ? "Ganjaran Belanja" : "Penebusan Diskaun Token")}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {date.toLocaleDateString("ms-MY", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {date.toLocaleTimeString("ms-MY", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:pl-4">
                      <span
                        className={`text-base font-extrabold ${
                          isEarned ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {isEarned ? "+" : "-"}
                        {Number(tx.amount).toLocaleString()} Token
                      </span>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {tx.type}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
