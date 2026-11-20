"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  User,
  LogIn,
  UserPlus,
  ShoppingBag,
  ChevronDown,
  Coins,
  ShieldCheck,
  LogOut,
  Users,
} from "lucide-react";
import { logoutUserAction } from "@/app/auth/actions";

export interface NavbarProps {
  user?: { id: string; email?: string } | null;
  profile?: {
    id: string;
    fullName: string;
    role: "CONSUMER" | "MERCHANT" | "ADMIN";
  } | null;
}

export function Navbar({ user, profile }: NavbarProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown bila pengguna klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    setIsDropdownOpen(false);
    await logoutUserAction();
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo SUNNO.ASIA */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
            <Store className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-primary">
            SUNNO<span className="text-slate-900">.ASIA</span>
          </span>
        </Link>

        {/* Pautan Navigasi Desktop */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <a href="#what-is-sunno" className="hover:text-primary transition">
            Apa Itu Sunno?
          </a>
          <a href="#for-merchants" className="hover:text-primary transition">
            Untuk Peniaga
          </a>
          <a href="#pioneer-offer" className="hover:text-primary transition">
            Tawaran Pioneer
          </a>
          <a href="#token-network" className="hover:text-primary transition">
            Token & Komisen
          </a>
          <Link
            href="/marketplace"
            className="flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 transition"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Marketplace
          </Link>
        </nav>

        {/* Butang Ikon Profil dengan Dropdown Pintar */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition shadow-2xs"
            aria-label="Pilihan Akaun"
          >
            {user ? (
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${
                  profile?.role === "ADMIN"
                    ? "bg-red-600"
                    : profile?.role === "MERCHANT"
                    ? "bg-primary"
                    : "bg-emerald-600"
                }`}
              >
                {profile?.role === "ADMIN" ? (
                  <ShieldCheck className="h-3.5 w-3.5" />
                ) : profile?.role === "MERCHANT" ? (
                  <Store className="h-3.5 w-3.5" />
                ) : (
                  <User className="h-3.5 w-3.5" />
                )}
              </div>
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-3.5 w-3.5" />
              </div>
            )}

            <span className="max-w-[130px] truncate">
              {user ? profile?.fullName || "Akaun Saya" : "Akaun"}
            </span>

            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>

          {/* Menu Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150 z-50">
              {user ? (
                <>
                  {/* Maklumat Pengguna Log Masuk */}
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {profile?.fullName || "Pengguna Sunno"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user.email}
                    </p>
                    <span
                      className={`inline-block mt-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                        profile?.role === "ADMIN"
                          ? "bg-red-100 text-red-700"
                          : profile?.role === "MERCHANT"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {profile?.role === "ADMIN"
                        ? "Superadmin (HQ)"
                        : profile?.role === "MERCHANT"
                        ? "Peniaga (Merchant)"
                        : "Pengguna (Consumer)"}
                    </span>
                  </div>

                  {/* Pautan Terus ke Portal Mengikut Peranan */}
                  {profile?.role === "MERCHANT" && (
                    <Link
                      href="/merchant/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-primary hover:bg-blue-50 transition"
                    >
                      <Store className="h-4 w-4" />
                      <span>Portal Peniaga</span>
                    </Link>
                  )}

                  {profile?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 transition"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Panel Superadmin</span>
                    </Link>
                  )}

                  {profile?.role === "CONSUMER" && (
                    <Link
                      href="/wallet"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 transition"
                    >
                      <Coins className="h-4 w-4 text-primary" />
                      <span>Dompet Token & Baki</span>
                    </Link>
                  )}

                  <Link
                    href="/network"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>Rangkaian 3-Tier</span>
                  </Link>

                  <Link
                    href="/marketplace"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <ShoppingBag className="h-4 w-4 text-emerald-600" />
                    <span>Marketplace</span>
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  {/* Butang Log Keluar */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Keluar</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Pilihan Akaun
                    </p>
                  </div>

                  <Link
                    href="/login"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-primary transition"
                  >
                    <LogIn className="h-4 w-4 text-primary" />
                    <span>Log Masuk</span>
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-primary transition"
                  >
                    <UserPlus className="h-4 w-4 text-emerald-600" />
                    <span>Daftar Akaun Baru</span>
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  <Link
                    href="/marketplace"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <ShoppingBag className="h-4 w-4 text-slate-500" />
                    <span>Buka Marketplace</span>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
