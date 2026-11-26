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
  Megaphone,
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

  // Cari kedai penjual bagi barang pertama dalam bakul
  const currentCartMerchant =
    cart.length > 0
      ? products.find((p) => p.merchants.id === cart[0].merchantId)?.merchants
      : null;

  // Semak jika kedai membenarkan diskaun token
  const merchantAllowsTokenDiscount = currentCartMerchant?.token_discount_enabled ?? true;
  const merchantMaxDiscountPercent = Number(currentCartMerchant?.max_token_discount_percent || 10) / 100;

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

  // Kiraan had maksimum token yang boleh ditebus mengikut ketetapan merchant
  const maxAllowedByMerchant = merchantAllowsTokenDiscount
    ? Math.floor(totalCartAmount * merchantMaxDiscountPercent)
    : 0;

  const maxRedeemableTokens = Math.min(
    userTokens,
    maxAllowedByMerchant,
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
              MORRA<span className="text-slate-900">.ASIA</span>
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
                {profile?.role === "AGEN_PROMOTER" && (
                  <Link
                    href="/network"
                    className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition"
                  >
                    <Megaphone className="h-3.5 w-3.5" />
                    <span>Portal Agen</span>
                  </Link>
                )}

                {profile?.role === "MERCHANT" && (
                  <Link
                    href="/merchant/dashboard"
                    className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-blue-100 transition"
                  >
                    <Store className="h-3.5 w-3.5" />
                    <span>Portal Peniaga</span>
                  </Link>
                )}

                {profile?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Panel Admin</span>
                  </Link>
                )}

                {(profile?.role === "USER" || !profile?.role) && (
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
                  Anda telah mengumpul{" "}
                  <strong>{Math.floor(Number(completedOrder.cash_paid_rm))} Token MORRA</strong>{" "}
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
                Belanja & Kumpul 1 Token bagi Setiap RM1.00
              </h1>
              <p className="mt-1 text-xs text-blue-100 max-w-xl leading-relaxed">
                Kumpul Token tanpa had dan tebus sebagai potongan diskaun segera pada pembelian seterusnya di kedai-kedai rakan kongsi MORRA.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-3.5 text-center border border-white/20">
                <span className="text-[10px] uppercase font-bold text-blue-200">Kadar Ganjaran</span>
                <p className="text-lg font-black">RM1 = 1 Token</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3.5 text-center border border-white/20">
                <span className="text-[10px] uppercase font-bold text-blue-200">Kadar Tebusan</span>
                <p className="text-lg font-black">1 T = RM1.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Butang Tapis Kategori */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`rounded-full px-4 py-2 text-xs font-bold transition shrink-0 ${
              selectedCategory === "ALL"
                ? "bg-primary text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Semua Produk
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition shrink-0 ${
                selectedCategory === c.id
                  ? "bg-primary text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Senarai Kad Produk */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 font-bold text-slate-900">Tiada produk tersenarai</h3>
            <p className="mt-1 text-xs text-slate-500">
              Kedai rakan kongsi MORRA sedang memuat naik barangan mereka.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-primary/50 hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {p.categories?.name || "Umum"}
                    </span>
                    <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      {p.merchants.shop_name}
                    </span>
                  </div>

                  <h3 className="mt-2 font-bold text-slate-900 group-hover:text-primary transition line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {p.description || "Produk berkualiti dari rakan niaga berdaftar MORRA."}
                  </p>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400">Harga</span>
                    <p className="text-base font-extrabold text-primary">
                      RM {parseFloat(String(p.price_rm)).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => addToCart(p)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-primary transition shadow-xs"
                    title="Tambah ke Bakul"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Slider Bakul Belanja (Sidebar Drawer) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="flex h-full w-full max-w-md flex-col justify-between bg-white p-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <h2 className="font-extrabold text-slate-900">Bakul Belanja</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center text-sm text-slate-400">
                  Bakul anda masih kosong.
                </div>
              ) : (
                <div className="mt-4 max-h-[45vh] overflow-y-auto divide-y divide-slate-100 pr-1">
                  <div className="mb-2 text-xs font-semibold text-slate-500">
                    Kedai: <strong>{cart[0].merchantName}</strong>
                  </div>

                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between py-3"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {item.productTitle}
                        </p>
                        <p className="text-[11px] text-primary font-semibold">
                          RM {item.price.toFixed(2)} x {item.quantity} = RM{" "}
                          {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
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
                {/* Bahagian Tebus Token */}
                {userTokens > 0 && merchantAllowsTokenDiscount && maxRedeemableTokens > 0 && (
                  <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50/80 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                        <Sparkles className="h-4 w-4" /> Tebus Token (1 Token = RM1 Diskaun)
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
                    <span>Fi Platform MORRA (5%):</span>
                    <span>Termasuk</span>
                  </div>

                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Caj CHIP Gateway (1%):</span>
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
