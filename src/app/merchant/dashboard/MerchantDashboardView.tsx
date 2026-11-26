"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Store,
  Crown,
  ShoppingBag,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Coins,
  Users,
  ArrowLeft,
  ExternalLink,
  Percent,
} from "lucide-react";
import {
  saveMerchantShopAction,
  addProductAction,
  deleteProductAction,
  payPioneerPackageAction,
  updateOrderStatusAction,
} from "../actions";
import type { MerchantDashboardViewProps } from "./types";

export function MerchantDashboardView({
  user,
  profile,
  merchant,
  products = [],
  orders = [],
  categories = [],
}: MerchantDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "profile">("orders");

  // State Profil Kedai & Tetapan Diskaun Token
  const [shopName, setShopName] = useState(merchant?.shop_name || "");
  const [slug, setSlug] = useState(merchant?.slug || "");
  const [description, setDescription] = useState(merchant?.description || "");
  const [address, setAddress] = useState(merchant?.address || "");
  const [tokenDiscountEnabled, setTokenDiscountEnabled] = useState(
    merchant?.token_discount_enabled ?? false
  );
  const [maxTokenDiscountPercent, setMaxTokenDiscountPercent] = useState(
    merchant?.max_token_discount_percent ? String(merchant.max_token_discount_percent) : "10"
  );
  const [profileMsg, setProfileMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // State Tambah Produk
  const [prodTitle, setProdTitle] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodMsg, setProdMsg] = useState("");
  const [addingProd, setAddingProd] = useState(false);

  // Bayaran Pioneer
  const [payingPioneer, setPayingPioneer] = useState(false);

  // Single Source of Truth bagi Status Pioneer RM512
  const isPaidPioneer = merchant?.pioneer_payment_status === "PAID" || Boolean(merchant?.is_active);

  // Kiraan Ringkasan Jualan
  const totalSalesRm = orders
    .filter((o) => o.status === "PAID" || o.status === "COMPLETED")
    .reduce((sum: number, o) => sum + Number(o.total_amount_rm), 0);
  const paidOrdersCount = orders.filter(
    (o) => o.status === "PAID" || o.status === "COMPLETED"
  ).length;

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");

    const res = await saveMerchantShopAction({
      shopName,
      slug,
      description,
      address,
      tokenDiscountEnabled,
      maxTokenDiscountPercent: parseFloat(maxTokenDiscountPercent) || 0,
    });
    setSavingProfile(false);

    if (res.error) setProfileMsg(`❌ ${res.error}`);
    else setProfileMsg("✅ Profil kedai dan tetapan diskaun Token berjaya disimpan!");
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!merchant) {
      alert("Sila lengkapkan profil kedai terlebih dahulu!");
      return;
    }
    setAddingProd(true);
    setProdMsg("");

    const res = await addProductAction({
      merchantId: merchant.id,
      title: prodTitle,
      description: prodDesc,
      priceRm: parseFloat(prodPrice),
      categoryId: prodCategory || undefined,
    });
    setAddingProd(false);

    if (res.error) {
      setProdMsg(`❌ ${res.error}`);
    } else {
      setProdMsg("✅ Produk berjaya ditambah!");
      setProdTitle("");
      setProdPrice("");
      setProdDesc("");
    }
  }

  async function handleDeleteProduct(id: string) {
    if (confirm("Adakah anda pasti mahu memadam produk ini?")) {
      await deleteProductAction(id);
    }
  }

  async function handleUpdateStatus(
    orderId: string,
    newStatus: "PENDING" | "PAID" | "CANCELLED" | "COMPLETED"
  ) {
    await updateOrderStatusAction(orderId, newStatus);
  }

  async function handlePayPioneer() {
    if (!merchant) {
      alert("Sila isi profil kedai terlebih dahulu sebelum membuat bayaran.");
      return;
    }
    setPayingPioneer(true);
    const res = await payPioneerPackageAction(merchant.id);
    setPayingPioneer(false);

    if (res.checkoutUrl) {
      window.location.href = res.checkoutUrl;
    } else {
      alert(res.error || "Gagal membuat sambungan bayaran CHIP.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header Dashboard */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Store className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-primary">
              MORRA<span className="text-slate-900">.ASIA</span>
            </span>
            <span className="ml-2 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-primary">
              Portal Peniaga
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* Butang Utama ke Marketplace */}
            <Link
              href="/marketplace"
              prefetch={false}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-emerald-700 transition"
              title="Pergi ke Marketplace Pembeli"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Ke Marketplace</span>
            </Link>

            {/* Pautan Pantas ke Dompet & Rangkaian */}
            <Link
              href="/wallet"
              className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-bold text-slate-700 hover:bg-slate-50 transition"
              title="Dompet Token"
            >
              <Coins className="h-3.5 w-3.5 text-primary" />
              <span>Dompet</span>
            </Link>

            <Link
              href="/network"
              className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-bold text-slate-700 hover:bg-slate-50 transition"
              title="Rangkaian Penaja"
            >
              <Users className="h-3.5 w-3.5 text-slate-600" />
              <span>Rangkaian</span>
            </Link>

            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline font-semibold text-slate-600 max-w-[120px] truncate">
              {profile?.full_name || user?.email}
            </span>

            <Link
              href="/"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              title="Kembali ke Laman Utama"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Banner Info untuk Pengguna (User) yang masuk ke Portal Peniaga */}
        {profile?.role === "USER" && !merchant && (
          <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50/70 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Store className="mt-1 h-6 w-6 shrink-0 text-primary" />
                <div>
                  <h3 className="font-bold text-slate-900">
                    Akaun Anda Berstatus Pengguna (User)
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Anda sedang melihat Portal Peniaga. Jika anda berhasrat untuk membuka kedai dan mula menjual produk di Marketplace MORRA, sila lengkapkan maklumat kedai dan sertai <strong>Pakej Pioneer (RM512)</strong> di bawah.
                  </p>
                </div>
              </div>
              <Link
                href="/marketplace"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition self-start sm:self-auto"
              >
                <span>Kembali ke Marketplace</span>
              </Link>
            </div>
          </div>
        )}

        {/* Banner Pioneer Status (RM512) — Single Source of Truth */}
        {!isPaidPioneer ? (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-1 h-6 w-6 shrink-0 text-amber-600" />
                <div>
                  <h3 className="font-bold text-amber-900">
                    Kedai Anda Belum Diaktifkan (Status Pioneer: {merchant?.pioneer_payment_status || "PENDING"})
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-amber-700">
                    Selesaikan yuran penyediaan <strong>Pakej Pioneer Merchant (RM512)</strong>{" "}
                    melalui CHIP untuk membolehkan produk anda muncul di Marketplace umum MORRA.
                  </p>
                </div>
              </div>
              <button
                onClick={handlePayPioneer}
                disabled={payingPioneer}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900 disabled:opacity-50"
              >
                <Crown className="h-4 w-4" />
                {payingPioneer ? "Menghubungi CHIP..." : "Bayar RM512 (CHIP)"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>
                Tahniah! Anda adalah <strong>Pioneer Merchant Sah & Aktif</strong>. Kedai anda kini dibuka kepada umum.
              </span>
            </div>
            <Link
              href="/marketplace"
              prefetch={false}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition shrink-0 self-start sm:self-auto"
            >
              <span>Lihat Kedai di Marketplace</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Tab Navigasi */}
        <div className="mb-6 flex gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
              activeTab === "orders"
                ? "bg-primary text-white"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Pesanan & Jualan ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
              activeTab === "products"
                ? "bg-primary text-white"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Store className="h-4 w-4" />
            Produk Saya ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
              activeTab === "profile"
                ? "bg-primary text-white"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            Profil & Tetapan Kedai
          </button>
        </div>

        {/* KANDUNGAN TAB 1: PESANAN & JUALAN */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Kad Ringkasan Jualan */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Jumlah Jualan Terkumpul</p>
                <p className="mt-1 text-2xl font-extrabold text-primary">
                  RM {totalSalesRm.toFixed(2)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Pesanan Dibayar (Paid)</p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                  {paidOrdersCount} Pesanan
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Produk Tersenarai</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {products.length} Item
                </p>
              </div>
            </div>

            {/* Senarai Pesanan Masuk */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="font-bold text-slate-900">Pesanan Pelanggan Terkini</h3>
              <p className="mt-1 text-xs text-slate-500">
                Urus status pesanan dan semak barang yang dibeli oleh pelanggan
              </p>

              {orders.length === 0 ? (
                <div className="mt-8 rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400">
                  Belum ada pesanan direkodkan untuk kedai ini.
                </div>
              ) : (
                <div className="mt-4 divide-y divide-slate-100">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
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
                                : o.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Pelanggan: <strong>{o.profiles?.full_name || "Pelanggan"}</strong> (
                          {o.profiles?.phone_number || "Tiada No. Tel"})
                        </p>

                        {/* Senarai Item Produk */}
                        {o.order_items && o.order_items.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {o.order_items.map((it) => (
                              <span
                                key={it.id}
                                className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                              >
                                {it.products?.title || "Produk"} x{it.quantity} (RM
                                {parseFloat(String(it.subtotal_rm)).toFixed(2)})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-primary">
                          RM {parseFloat(String(o.total_amount_rm)).toFixed(2)}
                        </span>

                        {/* Pilihan Tukar Status Pesanan */}
                        <select
                          value={o.status}
                          onChange={(e) =>
                            handleUpdateStatus(
                              o.id,
                              e.target.value as "PENDING" | "PAID" | "CANCELLED" | "COMPLETED"
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* KANDUNGAN TAB 2: PRODUK KEDAI */}
        {activeTab === "products" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Borang Tambah Produk */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-5">
              <h3 className="font-bold text-slate-900">Tambah Produk Baru</h3>
              <p className="mt-1 text-xs text-slate-500">
                Pamerkan barang atau servis anda di Marketplace
              </p>

              {prodMsg && (
                <div className="mt-4 rounded-lg bg-slate-100 p-3 text-xs font-medium">
                  {prodMsg}
                </div>
              )}

              <form onSubmit={handleAddProduct} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Nama / Tajuk Produk
                  </label>
                  <input
                    type="text"
                    required
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    placeholder="Contoh: Nasi Lemak Sambal Sotong"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Harga (RM)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="15.00"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Kategori
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Pilih Kategori (Pilihan)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Penerangan Produk
                  </label>
                  <textarea
                    rows={3}
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    placeholder="Bahan-bahan, saiz hidangan, atau maklumat penghantaran..."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingProd}
                  className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-blue-900 disabled:opacity-50"
                >
                  {addingProd ? "Menyimpan..." : "+ Tambah Produk"}
                </button>
              </form>
            </div>

            {/* Senarai Produk Semasa */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-7">
              <h3 className="font-bold text-slate-900">Senarai Produk Kedai</h3>
              <p className="mt-1 text-xs text-slate-500">
                Produk yang sedang tersenarai di bawah kedai anda
              </p>

              {products.length === 0 ? (
                <div className="mt-8 rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400">
                  Belum ada produk. Tambah produk pertama anda di sebelah kiri.
                </div>
              ) : (
                <div className="mt-4 divide-y divide-slate-100">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between py-3.5"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {p.title}
                        </h4>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-primary">
                            RM {parseFloat(String(p.price_rm)).toFixed(2)}
                          </span>
                          {p.categories?.name && (
                            <span>• {p.categories.name}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="Padam Produk"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* KANDUNGAN TAB 3: PROFIL KEDAI & TETAPAN TOKEN */}
        {activeTab === "profile" && (
          <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
            <h3 className="text-lg font-bold text-slate-900">
              Pengurusan Profil & Tetapan Kedai
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Maklumat ini akan dipaparkan kepada pembeli di MORRA Marketplace
            </p>

            {profileMsg && (
              <div className="mt-4 rounded-lg bg-slate-100 p-3 text-xs font-medium">
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Nama Kedai
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Contoh: Restoran Selera Warisan"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Pautan URL Kedai (Slug)
                </label>
                <div className="mt-1 flex items-center rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500">
                  <span>morra.asia/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="selera-warisan"
                    className="ml-1 w-full font-semibold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Alamat Fizikal Kedai
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="No. 12, Jalan Sultan Ismail, Kuala Lumpur"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Penerangan Ringkas Kedai
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan tentang perniagaan dan kepakaran kedai anda..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              {/* Tetapan Diskaun Penebusan Token (MORRA Fasa 1) */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Percent className="h-4 w-4" /> Tawaran Diskaun Penebusan Token
                    </span>
                    <p className="mt-0.5 text-[11px] text-slate-600">
                      Benarkan pembeli menebus Token mereka untuk potongan diskaun di kedai anda.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={tokenDiscountEnabled}
                    onChange={(e) => setTokenDiscountEnabled(e.target.checked)}
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                  />
                </div>

                {tokenDiscountEnabled && (
                  <div className="mt-3 border-t border-blue-200/60 pt-3">
                    <label className="block text-xs font-semibold text-slate-700">
                      Had Maksimum Diskaun Token (% daripada jumlah bil)
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={maxTokenDiscountPercent}
                        onChange={(e) => setMaxTokenDiscountPercent(e.target.value)}
                        className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold text-slate-900 outline-none focus:border-primary"
                      />
                      <span className="text-xs font-semibold text-slate-600">% diskaun</span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Contoh: Jika 10%, pesanan RM100 hanya boleh ditebus maksimum 10 Token (RM10 diskaun).
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-blue-900 disabled:opacity-50"
              >
                {savingProfile ? "Menyimpan..." : "Simpan Profil Kedai"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
