"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store } from "lucide-react";
import { loginUserAction } from "@/app/auth/actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const result = await loginUserAction({ email, password });
    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error);
      return;
    }

    // Halatuju mengikut Peranan (Role)
    if (result.role === "MERCHANT") {
      router.push("/merchant/dashboard");
    } else if (result.role === "ADMIN") {
      router.push("/admin");
    } else if (result.role === "AGEN_PROMOTER") {
      router.push("/network");
    } else {
      router.push("/marketplace");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <Store className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold text-primary">
            MORRA<span className="text-slate-900">.ASIA</span>
          </span>
        </Link>

        <h1 className="mt-6 text-center text-2xl font-bold text-slate-900">
          Log Masuk Akaun
        </h1>
        <p className="mt-1 text-center text-sm text-slate-600">
          Masukkan emel dan kata laluan anda untuk meneruskan
        </p>

        {errorMsg && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900 disabled:opacity-50"
          >
            {loading ? "Sedang Log Masuk..." : "Log Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          Belum mempunyai akaun?{" "}
          <Link href="/register" className="font-bold text-primary hover:underline">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
