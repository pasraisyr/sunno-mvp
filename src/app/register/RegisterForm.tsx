"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Store, ShoppingBag, Sparkles, Megaphone } from "lucide-react";
import { registerUserAction } from "@/app/auth/actions";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";
  const roleParam = searchParams.get("role");

  const initialRole: "USER" | "MERCHANT" | "AGEN_PROMOTER" =
    roleParam === "MERCHANT"
      ? "MERCHANT"
      : roleParam === "AGEN_PROMOTER"
      ? "AGEN_PROMOTER"
      : "USER";

  const [role, setRole] = useState<"USER" | "MERCHANT" | "AGEN_PROMOTER">(initialRole);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const result = await registerUserAction({
      email,
      password,
      fullName,
      phoneNumber,
      role,
      sponsorId: refCode || undefined,
    });

    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error);
      return;
    }

    // Bawa ke halaman mengikut peranan (role)
    if (result.role === "MERCHANT") {
      router.push("/merchant/dashboard");
    } else if (result.role === "AGEN_PROMOTER") {
      router.push("/network");
    } else {
      router.push("/marketplace");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <Store className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold text-primary">
            MORRA<span className="text-slate-900">.ASIA</span>
          </span>
        </Link>

        <h1 className="mt-6 text-center text-2xl font-bold text-slate-900">
          Daftar Akaun Baru
        </h1>
        <p className="mt-1 text-center text-sm text-slate-600">
          Pilih jenis akaun anda untuk mula menggunakan ekosistem MORRA
        </p>

        {/* Lencana Rujukan (Jika mendaftar melalui referral link) */}
        {refCode && (
          <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 p-2.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Mendaftar melalui jemputan penaja rangkaian MORRA</span>
          </div>
        )}

        {/* Pilihan 3 Role Rasmi MORRA */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setRole("USER")}
            className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-semibold transition ${
              role === "USER"
                ? "border-primary bg-blue-50 text-primary"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Pengguna
          </button>

          <button
            type="button"
            onClick={() => setRole("MERCHANT")}
            className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-semibold transition ${
              role === "MERCHANT"
                ? "border-primary bg-blue-50 text-primary"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Store className="h-4 w-4" />
            Peniaga
          </button>

          <button
            type="button"
            onClick={() => setRole("AGEN_PROMOTER")}
            className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-semibold transition ${
              role === "AGEN_PROMOTER"
                ? "border-primary bg-blue-50 text-primary"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Megaphone className="h-4 w-4" />
            Agen Promoter
          </button>
        </div>

        {/* Penerangan Ringkas Peranan yang Dipilih */}
        <div className="mt-2 text-center text-[11px] text-slate-500">
          {role === "USER" && "Beli-belah di Marketplace, kumpul Token & tebus diskaun."}
          {role === "MERCHANT" && "Buka kedai, jual produk & sertai Pakej Pioneer RM512."}
          {role === "AGEN_PROMOTER" && "Daftarkan merchant baharu & raih komisen 2-Level MORRA."}
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nama Penuh
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Muhammad Ali bin Ahmad"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nombor Telefon
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Contoh: 0123456789"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Alamat Emel
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Kata Laluan
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 aksara"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900 disabled:opacity-50"
          >
            {loading ? "Mendaftar Akaun..." : "Daftar Akaun"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          Sudah mempunyai akaun?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Log Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
