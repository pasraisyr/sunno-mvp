"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  ShoppingBag,
  Coins,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
  User,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { checkoutCartAction } from "./actions";
import type { CartItem, ProductItem, MarketplaceViewProps } from "./types";

export function MarketplaceView({
  user,
  profile,
  products = [],
  categories = [],
  userTokens = 0,
  completedOrder,
}: MarketplaceViewProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [tokensToRedeem, setTokensToRedeem] = useState<number>(0);

  // Tapis produk ikut kategori
  const filteredProducts =
    selectedCategory === "ALL"
      ? products
      : products.filter((p) => p.category_id === selectedCategory);

  // Fungsi Tambah ke Bakul
  function addToCart(p: ProductItem) {
    setCart((prev) => {
      // Jika bakul ada barang dari kedai berbeza, reset bakul (1 order per kedai)
      if (prev.length > 0 && prev[0].merchantId !== p.merchants.id) {
        if (
          !confirm(
            `Bakul anda kini mengandungi barang dari kedai lain. Kosongkan bakul untuk membeli dari ${p.merchants.shop_name}?`
          )
        ) {
          return prev;
        }
        return [
          {
            productId: p.id,
            productTitle: p.title,
            price: Number(p.price_rm),
            merchantId: p.merchants.id,
            merchantName: p.merchants.shop_name,
            quantity: 1,
          },
        ];
      }

      const existingIndex = prev.findIndex((item) => item.productId === p.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: p.id,
            productTitle: p.title,
            price: Number(p.price_rm),
            merchantId: p.merchants.id,
            merchantName: p.merchants.shop_name,
            quantity: 1,
          },
        ];
      }
    });
    setIsCartOpen(true);
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  }

  const totalCartAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Kiraan had maksimum token yang boleh ditebus
  const maxRedeemableTokens = Math.min(
    userTokens,
    Math.floor(totalCartAmount)
  );

  // Nilai token yang ditebus sebenarnya
  const effectiveTokensToRedeem = Math.min(
    tokensToRedeem,
    maxRedeemableTokens
  );

  // Baki tunai kena bayar
  const cashToPay = Math.max(0, totalCartAmount - effectiveTokensToRedeem);

  // Ganjaran token baru dari belian tunai (RM1 = 1 Token)
  const tokensToEarn = Math.floor(cashToPay);

  // Proses Bayar via CHIP / Tebus Penuh
  async function handleCheckout() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (cart.length === 0) return;

    setCheckingOut(true);
    const res = await checkoutCartAction({
      merchantId: cart[0].merchantId,
      items: cart,
      tokensToRedeem: effectiveTokensToRedeem,
    });
    setCheckingOut(false);

    if (res.redirectUrl) {
      router.push(res.redirectUrl);
    } else if (res.checkoutUrl) {
      window.location.href = res.checkoutUrl;
    } else {
      alert(res.error || "Gagal membuka sesi pembayaran CHIP.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header Marketplace */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Store className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-primary">
              SUNNO<span className="text-slate-900">.ASIA</span>
            </span>
            <span className="ml-2 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
              Marketplace
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Paparan Baki Token */}
            {user && (
              <Link
                href="/wallet"
                className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-primary hover:bg-blue-100 transition"
                title="Buka Dompet Token"
              >
                <Coins className="h-4 w-4" />
                <span>{userTokens} Token</span>
              </Link>
            )}

            {/* Butang Bakul Belanja */}
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <ShoppingCart className="h-4 w-4 text-primary" />
              <span>Bakul</span>
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-white">
                  {totalCartItems}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/network"
                  className="hidden sm:inline-block text-xs font-bold text-slate-600 hover:text-primary transition"
                >
                  Rangkaian
                </Link>

                {profile?.role === "MERCHANT" ? (
                  <Link
                    href="/merchant/dashboard"
                    className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-blue-100 transition"
                  >
                    <Store className="h-3.5 w-3.5" />
                    <span>Portal Peniaga</span>
                  </Link>
                ) : profile?.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Panel Admin</span>
                  </Link>
                ) : (
                  <Link
                    href="/wallet"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    title="Akaun Pengguna & Dompet"
                  >
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    <span>{profile?.fullName || "Akaun Saya"}</span>
                  </Link>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-blue-900"
              >
                Log Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Notifikasi Kejayaan Pesanan (Jika baru bayar) */}
      {completedOrder && (
        <div className="border-b border-emerald-200 bg-emerald-50 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-900 text-sm">
                  Pembayaran Berjaya! Pesanan #{completedOrder.id.slice(0, 8)} Disahkan.
                </p>
                <p className="text-xs text-emerald-700">
                  Anda telah menerima{" "}
                  <strong>{Math.floor(Number(completedOrder.cash_paid_rm))} Token Sunno</strong>{" "}
                  (RM1 tunai = 1 Token) ke dalam lejar akaun anda!
                </p>
              </div>
            </div>
            <Link
              href="/marketplace"
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              Tutup
            </Link>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Banner Info Ganjaran */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-900 to-primary p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-100">
                <Coins className="h-3.5 w-3.5" /> Ganjaran Setiap Pembelian
              </span>
              <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                Belanja & Dapatkan 1 Token bagi Setiap RM1.00
              </h1>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                Sokong produk rakan niaga tempatan dan tebus token untuk penjimatan segera semasa pembayaran.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Penapis Kategori */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`rounded-lg px-4 py-2 text-xs font-bold shrink-0 transition ${
              selectedCategory === "ALL"
                ? "bg-primary text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Semua Produk ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`rounded-lg px-4 py-2 text-xs font-bold shrink-0 transition ${
                selectedCategory === c.id
                  ? "bg-primary text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Senarai Kad Produk */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-400 text-sm">
            Tiada produk aktif dijumpai dalam kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-primary flex items-center gap-1">
                      <Store className="h-3.5 w-3.5" />
                      {p.merchants?.shop_name}
                    </span>
                    {p.categories?.name && (
                      <span className="rounded bg-slate-100 px-2 py-0.5">
                        {p.categories.name}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{p.title}</h3>
                  {p.description && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-xs text-slate-400">Harga:</span>
                    <span className="text-lg font-extrabold text-slate-900">
                      RM {Number(p.price_rm).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(p)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-900 transition"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    + Tambah Ke Bakul
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* SLIDE-OVER BAKUL BELANJA (CART DRAWER) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="flex h-full w-full max-w-md flex-col justify-between bg-white p-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <span>Bakul Belanja ({totalCartItems})</span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center text-sm text-slate-400">
                  Bakul anda masih kosong.
                </div>
              ) : (
                <div className="mt-4 divide-y divide-slate-100 overflow-y-auto max-h-[45vh]">
                  <p className="text-xs text-slate-500 mb-2">
                    Kedai: <strong>{cart[0]?.merchantName}</strong>
                  </p>
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{item.productTitle}</h4>
                        <p className="text-xs font-semibold text-primary">
                          RM {item.price.toFixed(2)} x {item.quantity} = RM{" "}
                          {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="rounded-md border border-slate-200 p-1 hover:bg-slate-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="rounded-md border border-slate-200 p-1 hover:bg-slate-50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-slate-200 pt-4">
                {/* Bahagian Tebus Token (Jika ada baki token) */}
                {userTokens > 0 && (
                  <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50/80 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                        <Sparkles className="h-4 w-4" /> Tebus Token Sunno (1 Token = RM1)
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        Baki: <strong>{userTokens}</strong>
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max={maxRedeemableTokens}
                        value={effectiveTokensToRedeem}
                        onChange={(e) => setTokensToRedeem(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <span className="w-12 text-center text-xs font-extrabold text-primary">
                        {effectiveTokensToRedeem} T
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => setTokensToRedeem(0)}
                        className="text-slate-500 hover:underline"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => setTokensToRedeem(maxRedeemableTokens)}
                        className="font-bold text-primary hover:underline"
                      >
                        Guna Maksimum ({maxRedeemableTokens} Token)
                      </button>
                    </div>
                  </div>
                )}

                {/* Ringkasan Pengiraan Pembayaran */}
                <div className="mb-4 space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Jumlah Pesanan:</span>
                    <span className="font-semibold text-slate-900">
                      RM {totalCartAmount.toFixed(2)}
                    </span>
                  </div>

                  {effectiveTokensToRedeem > 0 && (
                    <div className="flex justify-between font-semibold text-emerald-600">
                      <span>Diskaun Token ({effectiveTokensToRedeem} Token):</span>
                      <span>-RM {effectiveTokensToRedeem.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Caj Pengurusan Platform (2%):</span>
                    <span>Termasuk</span>
                  </div>

                  <div className="border-t border-slate-200 pt-2 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      Baki Tunai Dibayar:
                    </span>
                    <span className="text-2xl font-extrabold text-primary">
                      RM {cashToPay.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px] font-semibold text-blue-700">
                    <span>Ganjaran Token Pembelian Ini:</span>
                    <span>+{tokensToEarn} Token</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-900 transition disabled:opacity-50"
                >
                  {checkingOut ? (
                    "Memproses Pesanan..."
                  ) : cashToPay === 0 ? (
                    <>
                      <span>Sahkan Pembayaran 100% Token</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Bayar Tunai RM {cashToPay.toFixed(2)} (CHIP)</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
