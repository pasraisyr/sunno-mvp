"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Store, User, ShoppingBag, Sparkles } from "lucide-react";
import { registerUserAction } from "@/app/auth/actions";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";
  const defaultRole =
    searchParams.get("role") === "MERCHANT" ? "MERCHANT" : "CONSUMER";

  const [role, setRole] = useState<"CONSUMER" | "MERCHANT">(defaultRole);
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
            SUNNO<span className="text-slate-900">.ASIA</span>
          </span>
        </Link>

        <h1 className="mt-6 text-center text-2xl font-bold text-slate-900">
          Daftar Akaun Baru
        </h1>
        <p className="mt-1 text-center text-sm text-slate-600">
          Pilih jenis akaun anda untuk mula menggunakan ekosistem Sunno
        </p>

        {/* Lencana Rujukan (Jika mendaftar melalui referral link) */}
        {refCode && (
          <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 p-2.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Mendaftar melalui jemputan penaja rangkaian Sunno</span>
          </div>
        )}

        {/* Pilihan Role: Pengguna vs Peniaga */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("CONSUMER")}
            className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm font-semibold transition ${
              role === "CONSUMER"
                ? "border-primary bg-blue-50 text-primary"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            Pengguna
          </button>

          <button
            type="button"
            onClick={() => setRole("MERCHANT")}
            className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm font-semibold transition ${
              role === "MERCHANT"
                ? "border-primary bg-blue-50 text-primary"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <User className="h-5 w-5" />
            Peniaga (Merchant)
          </button>
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
              placeholder="Contoh: Ahmad Albab"
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
            {loading
              ? "Sedang Mendaftar..."
              : role === "MERCHANT"
              ? "Daftar Sebagai Peniaga"
              : "Daftar Sebagai Pengguna"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          Sudah mempunyai akaun?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Log Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
