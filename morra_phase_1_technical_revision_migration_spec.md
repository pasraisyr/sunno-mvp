# MORRA.ASIA — PHASE 1 MVP REVISION & MIGRATION SPECIFICATION
**Status:** Pre-Implementation Audit & Master Blueprint (Upgrade from SUNNO MVP)  
**Target Stack:** Next.js (App Router, TypeScript), Tailwind CSS, Shadcn UI, Supabase (PostgreSQL), CHIP Collect API  
**Prinsip Utama:** *Modular Upgrade — Kekalkan struktur sedia ada yang relevan, buang sistem 3-Level & Cashback, jangan bina semula dari kosong.*

---

## 1. LAPORAN AUDIT SISTEM SEDIA ADA (SUNNO → MORRA)

Berdasarkan semakan ke atas seni bina SUNNO MVP sedia ada (termasuk skema Supabase, migrasi `add_split_settlement_to_orders`, integrasi CHIP, dan modul frontend), berikut adalah dapatan audit sebelum sebarang perubahan kod dilakukan:

### A. Status Modul & Ketidakseragaman (Discrepancies)
1. **Percanggahan Status Plan Pioneer RM512:**
   - **Isu:** Admin Panel memaparkan `LUNAS (HQ)`, tetapi Merchant Dashboard memaparkan `Pioneer Pending`.
   - **Punca:** Sumber kebenaran (*Single Source of Truth*) tidak diselaraskan antara jadual `payments` / rekod manual HQ dengan kolum status pada jadual `merchants` atau `profiles`.
   - **Tindakan:** Satukan logik status ke satu kolum/jadual sah yang dikemas kini secara automatik melalui webhook CHIP atau pengesahan admin HQ.
2. **Enjin Komisen & Networking (3-Level Lama):**
   - **Isu:** Sistem lama menggunakan `L1 (50%), L2 (15%), L3 (12.5%), Company (22.5%)` daripada Commission Pool 10% serta konsep `Partner / Networker` yang mempunyai downline berlapis.
   - **Tindakan:** Rombak sepenuhnya enjin komisen kepada **Model 2-Level MORRA** berdasarkan **Fi Platform 5%**.
3. **Konsep & Terminologi Token:**
   - **Isu:** Terdapat label atau rujukan berkaitan *Cashback* dan struktur persediaan *Token Shop*.
   - **Tindakan:** Tukar semua label kepada konsep rasmi **"Belanja → Kumpul Token → Tebus Diskaun"**. Bekukan Token Shop untuk Fasa 1.
4. **Penjenamaan & Konfigurasi CHIP:**
   - **Isu:** Paparan UI, resit, emel, dan akaun CHIP masih berdaftar atas nama `SUNNO.ASIA`.
   - **Tindakan:** Kemas kini UI/UX kepada **MORRA / MORRA.ASIA** (kekalkan logo matahari & tema warna Royal Blue `#1E40AF` + Putih). Semak status kelulusan penjenamaan dengan pihak CHIP sebelum menukar konfigurasi production.

---

## 2. KLASIFIKASI MODUL (KEKAL, UBAH, BUANG)

### 🟢 Modul Dikekalkan (Retain & Stabilize)
- **Teras Teknologi:** Next.js Full-Stack, Tailwind CSS, Shadcn UI, Supabase Auth & PostgreSQL.
- **Identiti Visual:** Logo matahari sedia ada & tema warna Royal Blue + Putih.
- **CHIP Collect Integration:** Aliran pembayaran, webhook handler, pengurusan Test Mode / Live Mode, dan rekod rujukan pembayaran.
- **Plan Pioneer RM512:** Aliran pendaftaran merchant dan pembayaran yuran penyediaan sistem RM512.
- **Marketplace & E-Commerce:** Senarai merchant, katalog produk, carian, kategori, profil kedai, *shopping cart*, dan *checkout*.
- **Merchant Dashboard:** Pengurusan profil kedai, produk (harga, gambar, kategori, stok), pesanan masuk, rekod jualan, dan wallet.
- **Teras Token Ledger:** Struktur lejar berasingan daripada wang tunai (kadar ujian dikekalkan pada `RM1 = 1 Token`).

### 🟡 Modul Diubah Suai (Modify & Upgrade)
- **Identiti & Penjenamaan:** Tukar semua teks/paparan `SUNNO` / `SUNNO.ASIA` kepada `MORRA` / `MORRA.ASIA`.
- **Role-Based Access Control (RBAC):** Penstrukturan semula kepada 3 peranan rasmi (`AGEN_PROMOTER`, `MERCHANT`, `USER`) + `ADMIN`.
- **Commission & Referral Engine:** Tukar dari 3-Level kepada **2-Level** berasaskan **Fi Platform 5%** mengikut Senario A, B, dan C.
- **Sinkronisasi Status Pioneer RM512:** Penyatuan status pembayaran antara Admin Panel dan Merchant Dashboard + pengaktifan automatik selepas pembayaran CHIP berjaya.
- **Settlement & Wallet Ledger:** Pemisahan jelas antara Jualan Kasar, Fi Platform MORRA (5%), Komisen Agen/Merchant, Caj Gateway CHIP, dan Jualan Bersih Merchant.
- **Admin Panel:** Penggantian metrik lama dengan laporan transaksi sebenar berasaskan Fi 5% dan struktur 2-Level.

### 🔴 Modul Dibuang (Deprecate & Remove)
- **Sistem Networking Level 3 (L3):** Semua fungsi, jadual/kolum L3, paparan UI, dan pengiraan komisen L3.
- **Komisen Partner-to-Partner & Downline Berlapis:** Agen Promoter tidak lagi mempunyai downline agen lain.
- **Formula Lama:** Pengiraan *Commission Pool 10%* dan *Agihan Syarikat 22.5%*.
- **Konsep Cashback & Token Shop:** Semua label "Cashback", promosi berbentuk pulangan tunai, dan modul Token Shop dalam Fasa 1.
- **Data Demonstrasi (Dummy Data):** Dilarang menggunakan data statik sebagai rekod transaksi sebenar.

---

## 3. SPESIFIKASI TEKNIKAL & LOGIK PERNIAGAAN BAHARU

### 3.1 Struktur Akaun & RBAC (Role-Based Access Control)
Sistem hanya mengiktiraf tiga (3) kategori pengguna utama (selain `ADMIN`):

| Kategori Akaun | Kod Peranan (`role`) | Hak Akses & Fungsi Utama | Sekatan Sistem |
| :--- | :--- | :--- | :--- |
| **Agen Promoter** | `AGEN_PROMOTER` | Menggantikan istilah *Partner/Networker*. Mempunyai referral link unik untuk mendaftarkan Merchant baharu. Menerima komisen mengikut struktur MORRA. | **Tiada downline antara agen.** Tidak mendapat hak networking daripada pendaftaran agen lain. |
| **Merchant** | `MERCHANT` | Mengurus profil kedai, produk, stok, pesanan, diskaun Token, rekod komisen & pengeluaran wallet. Boleh merujuk pelanggan & merchant lain. | Tidak automatik menjadi Agen Promoter. |
| **User** | `USER` | Membeli di Marketplace, mengumpul & menebus Token untuk diskaun checkout. | **Tiada hak networking/downline.** Tidak dipaparkan struktur komisen MORRA. |

---

### 3.2 Enjin Komisen 2-Level (Berasaskan Fi Platform 5%)
- **Asas Kiraan:** MORRA mengenakan **Fi Platform = 5%** daripada nilai transaksi yang layak.
- **Peraturan Agihan:** Semua peratusan komisen di bawah dikira daripada **nilai Fi Platform 5% tersebut** (bukan daripada jumlah jualan kasar).
- **Peraturan Keselamatan:**
  - Tiada Level 3 dalam apa jua keadaan.
  - Tiada pengkreditan komisen berganda (*idempotency check* menggunakan `transaction_id`).
  - Jika tiada hubungan referral yang sah wujud, baki bahagian komisen tersebut kekal milik **MORRA**.

#### Matriks Agihan Wajib (3 Senario):

1. **Senario A: Agen Ali memperkenalkan Merchant A** *(Apabila Merchant A melakukan transaksi/belian dengan mana-mana merchant berdaftar)*
   - **Agen Ali (L1):** `50%` daripada Fi MORRA (bersamaan `2.5%` nilai transaksi)
   - **MORRA:** `50%` daripada Fi MORRA (bersamaan `2.5%` nilai transaksi)

2. **Senario B: Pelanggan Merchant A membeli di Merchant A sendiri** *(Merchant A diperkenalkan oleh Agen Ali)*
   - **Merchant A (L1 - Perujuk Pelanggan):** `50%` daripada Fi MORRA (`2.5%` nilai transaksi)
   - **Agen Ali (L2 - Perujuk Merchant A):** `10%` daripada Fi MORRA (`0.5%` nilai transaksi)
   - **MORRA:** `40%` daripada Fi MORRA (`2.0%` nilai transaksi)
   *(Nota: Jika Merchant A tiada Agen Perujuk, bahagian 10% Agen Ali kembali kepada MORRA menjadikan MORRA = 50%)*

3. **Senario C: Pelanggan Merchant A membeli di Merchant B**
   - **Merchant A (L1 - Perujuk Pelanggan):** `50%` daripada Fi MORRA (`2.5%` nilai transaksi)
   - **Merchant B (Penjual):** `0%` komisen networking (menerima hasil jualan bersih selepas tolak fi platform & caj gateway)
   - **MORRA:** `50%` daripada Fi MORRA (`2.5%` nilai transaksi)

---

### 3.3 Plan Pioneer RM512 & Sinkronisasi Status
- **Definisi:** Pakej pendaftaran dan penyediaan sistem untuk merchant (bukan yuran agen/downline/pelaburan).
- **Penyelesaian Bug Status (`LUNAS (HQ)` vs `Pioneer Pending`):**
  - Mewujudkan medan status tunggal: `pioneer_payment_status` (`UNPAID`, `PENDING`, `PAID`, `REVOKED`) dan `merchant_status` (`INACTIVE`, `ACTIVE`, `SUSPENDED`).
  - Apabila webhook CHIP mengesahkan bayaran RM512 berjaya (`paid`), sistem secara automatik menukar `pioneer_payment_status = 'PAID'` dan `merchant_status = 'ACTIVE'`.
  - Kedua-dua **Admin Panel** dan **Merchant Dashboard** wajib membaca status daripada sumber data yang sama.
  - Admin mengekalkan kawalan untuk menyahaktifkan akaun (`SUSPENDED`) jika berlaku pelanggaran polisi.

---

### 3.4 Sistem Token Fasa 1 (*Earn & Redeem Discount*)
- **Konsep Rasmi:** `Belanja → Kumpul Token → Tebus Diskaun`
- **Peraturan:**
  - Token **bukan wang tunai** dan tidak boleh dikeluarkan (*non-withdrawable*).
  - **Mendapatkan Token:** Dikreditkan ke `Token Wallet` hanya selepas status pesanan disahkan `PAID` / selesai. Kadar semasa: `RM1 = 1 Token` (disimpan dalam jadual konfigurasi sistem supaya mudah diubah kemudian).
  - **Menebus Token:** Digunakan sebagai diskaun semasa *checkout*. Kadar dan syarat diskaun ditentukan secara bebas oleh setiap merchant di Merchant Dashboard (MORRA tidak memaksa merchant memberi diskaun).

---

### 3.5 Pengasingan Aliran Kewangan & Settlement
Setiap transaksi pesanan mesti merekodkan pecahan lejar berikut secara berasingan (tidak bercampur):
1. `gross_amount`: Nilai jualan kasar (termasuk produk/penghantaran sebelum atau selepas diskaun token mengikut resit).
2. `token_discount_amount`: Nilai diskaun yang ditanggung oleh merchant hasil penebusan Token.
3. `chip_gateway_fee`: Caj pemprosesan transaksi oleh pihak CHIP.
4. `morra_platform_fee`: Fi platform MORRA (`5%` daripada nilai layak).
5. `promoter_commission`: Bahagian komisen untuk Agen Promoter (jika layak).
6. `referrer_merchant_commission`: Bahagian komisen untuk Merchant Perujuk (jika layak).
7. `morra_net_revenue`: Baki bersih fi platform milik MORRA.
8. `merchant_net_settlement`: Jumlah bersih yang akan dikreditkan ke Wallet Merchant.

---

## 4. CADANGAN DATABASE MIGRATION (SUPABASE / POSTGRESQL)

> **Peringatan Keselamatan:** Lakukan *full database snapshot/backup* dan *source code backup* sebelum menjalankan skrip migrasi ini. Migrasi direka untuk mengekalkan rekod lama tanpa kehilangan sejarah transaksi.

```sql
-- ============================================================================
-- MIGRATION: SUNNO MVP TO MORRA PHASE 1
-- ============================================================================

BEGIN;

-- 1. Kemas kini Enum / Kekangan Role Pengguna (Agen Promoter, Merchant, User, Admin)
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_role_check;

UPDATE public.profiles 
  SET role = 'AGEN_PROMOTER' 
  WHERE role IN ('PARTNER', 'NETWORKER');

ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('ADMIN', 'AGEN_PROMOTER', 'MERCHANT', 'USER'));

-- 2. Selaraskan Status Plan Pioneer RM512 pada Jadual Merchants (Single Source of Truth)
ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS pioneer_payment_status VARCHAR(20) DEFAULT 'UNPAID' 
    CHECK (pioneer_payment_status IN ('UNPAID', 'PENDING', 'PAID', 'REVOKED')),
  ADD COLUMN IF NOT EXISTS pioneer_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pioneer_payment_ref VARCHAR(100),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS referred_by_promoter_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS token_discount_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS max_token_discount_percent NUMERIC(5,2) DEFAULT 0.00;

-- Migrasi data sedia ada yang telah lunas di HQ tetapi masih pending di paparan merchant
UPDATE public.merchants m
SET 
  pioneer_payment_status = 'PAID',
  is_active = TRUE
WHERE EXISTS (
  SELECT 1 FROM public.payments p 
  WHERE p.merchant_id = m.id 
    AND p.payment_type = 'PIONEER_512' 
    AND p.status IN ('PAID', 'LUNAS')
);

-- 3. Struktur Referral 2-Level (Buang kebergantungan L3)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referred_by_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS referred_by_role VARCHAR(20);

-- Arkibkan kolum L3 lama jika wujud (jangan padam terus sebelum audit selesai, cuma nyahaktifkan)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='network_trees' AND column_name='level_3_id') THEN
    ALTER TABLE public.network_trees RENAME COLUMN level_3_id TO deprecated_level_3_id;
  END IF;
END $$;

-- 4. Jadual Konfigurasi Dinamik MORRA (Fi 5% & Kadar Token)
CREATE TABLE IF NOT EXISTS public.system_configs (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.system_configs (key, value, description) VALUES
  ('PLATFORM_FEE_PERCENT', '5.0', 'Fi platform rasmi MORRA (5%)'),
  ('COMMISSION_SPLIT_SCENARIO_A', '{"promoter_l1": 50, "morra": 50}', 'Senario A: Agen -> Merchant beli dari merchant berdaftar'),
  ('COMMISSION_SPLIT_SCENARIO_B', '{"merchant_l1": 50, "promoter_l2": 10, "morra": 40}', 'Senario B: Pelanggan Merchant A beli di Merchant A'),
  ('COMMISSION_SPLIT_SCENARIO_C', '{"merchant_l1": 50, "merchant_seller": 0, "morra": 50}', 'Senario C: Pelanggan Merchant A beli di Merchant B'),
  ('TOKEN_EARN_RATE', '{"rm_per_token": 1}', 'Kadar ujian: RM1 = 1 Token')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- 5. Pecahan Lejar Kewangan & Settlement pada Orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS gross_amount NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS token_discount_amount NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS chip_gateway_fee NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS morra_platform_fee NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS merchant_net_amount NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS commission_processed BOOLEAN DEFAULT FALSE;

-- 6. Jadual Rekod Agihan Komisen 2-Level (Audit Trail & Anti-Duplicate)
CREATE TABLE IF NOT EXISTS public.commission_ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  scenario_type VARCHAR(20) NOT NULL CHECK (scenario_type IN ('SCENARIO_A', 'SCENARIO_B', 'SCENARIO_C', 'NO_REFERRAL')),
  recipient_id UUID REFERENCES public.profiles(id), -- NULL jika bahagian MORRA
  recipient_role VARCHAR(20) NOT NULL CHECK (recipient_role IN ('AGEN_PROMOTER', 'MERCHANT', 'MORRA')),
  network_level INT CHECK (network_level IN (0, 1, 2)), -- 0 untuk MORRA, 1 untuk L1, 2 untuk L2
  platform_fee_base NUMERIC(12,2) NOT NULL,
  percentage_allocated NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'CREDITED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id, recipient_role, network_level) -- Menghalang komisen berganda
);

COMMIT;
```

---

## 5. ANGGARAN TEMPOH PEMBANGUNAN (14 HARI BEKERJA / 2 MINGGU SPRINT)

Memandangkan asas MVP telah siap dan kerja ini bersifat **naik taraf modular**, anggaran tempoh pelaksanaan adalah seperti berikut:

| Fasa | Skop Kerja Utama | Tempoh |
| :--- | :--- | :--- |
| **Fasa 1: Backup & Audit Kod** | Backup penuh DB & repositori, audit semua fail API, webhook CHIP, dan semakan skema Supabase sedia ada. | **Hari 1 – 2** |
| **Fasa 2: DB Migration & RBAC** | Jalankan migrasi SQL, kemas kini peranan (`AGEN_PROMOTER`, `MERCHANT`, `USER`), dan baiki bug sinkronisasi status RM512. | **Hari 3 – 4** |
| **Fasa 3: Commission Engine 2-Level** | Bina fungsi pengiraan Fi 5% & Senario A/B/C, buang sepenuhnya kod L3 & formula lama, dan pasang kawalan anti-duplikasi. | **Hari 5 – 7** |
| **Fasa 4: Rebranding & Token Cleanup** | Tukar identiti `SUNNO` → `MORRA` pada semua halaman/dashboard, buang label `Cashback`, dan kemas kini tetapan diskaun Token Merchant. | **Hari 8 – 9** |
| **Fasa 5: Admin Panel & Settlement** | Kemas kini laporan kewangan sebenar di Admin Panel, asingkan caj CHIP vs Fi MORRA, dan sahkan aliran wallet/pengeluaran. | **Hari 10 – 11** |
| **Fasa 6: UAT & Dokumentasi** | Jalankan 15 kes ujian wajib menggunakan CHIP Test Mode, sediakan laporan ujian dan serahan dokumentasi kepada pemilik. | **Hari 12 – 14** |

---

## 6. SENARAI UJIAN WAJIB SEBELUM PELANCARAN (UAT CHECKLIST)

Semua ujian berikut wajib dijalankan dalam persekitaran **Staging / CHIP Test Mode** dan disahkan tepat sebelum mengaktifkan **Live Mode**:

### A. Akaun & Kawalan Akses (RBAC)
- [ ] **Ujian 1:** Pendaftaran akaun baharu bagi kategori **Agen Promoter**, **Merchant**, dan **User**.
- [ ] **Ujian 2:** Pengesahan RBAC — User tidak boleh akses paparan komisen networking; Agen Promoter tidak mempunyai fungsi bina downline agen lain.
- [ ] **Ujian 3:** Pendaftaran Merchant menggunakan pautan rujukan (*referral link*) Agen Promoter merekodkan hubungan `referred_by_promoter_id` dengan tepat.

### B. Plan Pioneer RM512 & CHIP Gateway
- [ ] **Ujian 4:** Pembayaran Plan Pioneer RM512 menggunakan **CHIP Test Mode**.
- [ ] **Ujian 5:** Pengesahan *Webhook Signature* CHIP mengemas kini status pembayaran secara automatik.
- [ ] **Ujian 6:** **Pengaktifan Automatik Merchant** — Sebaik sahaja RM512 dibayar, akaun merchant aktif serta-merta tanpa sekatan manual.
- [ ] **Ujian 7:** **Audit Konsistensi Status** — Status pada Admin Panel dan Merchant Dashboard memaparkan status yang sama (`PAID / LUNAS`).
- [ ] **Ujian 8:** Ujian penghantaran webhook berulang (*replay attack / duplicate webhook*) tidak menghasilkan rekod bayaran atau pengaktifan berganda.

### C. E-Commerce & Enjin Komisen 2-Level (Fi 5%)
- [ ] **Ujian 9:** Merchant menambah produk (gambar, harga, kategori, stok) dan produk dipaparkan di Marketplace di bawah kedai yang betul.
- [ ] **Ujian 10 (Senario A):** Agen Ali perkenal Merchant A → Merchant A buat transaksi dengan merchant berdaftar → Semak agihan: **Agen Ali (50% drpd fi 5%)**, **MORRA (50% drpd fi 5%)**.
- [ ] **Ujian 11 (Senario B):** Pelanggan Merchant A beli di Merchant A → Semak agihan: **Merchant A (50% drpd fi 5%)**, **Agen Ali (10% drpd fi 5%)**, **MORRA (40% drpd fi 5%)**.
- [ ] **Ujian 12 (Senario C):** Pelanggan Merchant A beli di Merchant B → Semak agihan: **Merchant A (50% drpd fi 5%)**, **Merchant B (0%)**, **MORRA (50% drpd fi 5%)**.
- [ ] **Ujian 13 (Tiada Referral / L3):** Transaksi tanpa referral sah menyalurkan 100% daripada fi 5% kepada MORRA, dan tiada pengiraan L3 wujud dalam pangkalan data.

### D. Token System & Settlement Kewangan
- [ ] **Ujian 14:** **Pengkreditan Token** — Pembelian berjaya mengkreditkan Token ke wallet User (`RM1 = 1 Token`) dalam Token Ledger tanpa duplikasi.
- [ ] **Ujian 15:** **Penebusan Token** — User menebus Token semasa checkout di kedai merchant yang mengaktifkan diskaun Token, dan baki Token ditolak dengan tepat.
- [ ] **Ujian 16:** **Audit Settlement & Pengeluaran** — Rekod transaksi memisahkan dengan jelas Nilai Kasar, Diskaun Token, Caj CHIP, Fi MORRA 5%, Komisen, Baki Wallet Merchant, dan Rekod Pengeluaran.

---

## 7. SENARAI SERAHAN PROJEK (DELIVERABLES)

Setelah fasa ujian diluluskan oleh pemilik MORRA, pembangun akan menyerahkan:
1. **Source Code Terkini** (Git repository penuh di bawah hak milik MORRA).
2. **Database Schema & Migration Files** (`.sql` bersih dan terdokumentasi).
3. **Senarai Environment Variables** (`.env.example` tanpa mendedahkan kunci rahsia *production*).
4. **Dokumentasi Teknikal:**
   - Dokumentasi Integrasi CHIP Collect API & Webhook.
   - Dokumentasi Enjin Komisen 2-Level & Formula Fi 5%.
   - Dokumentasi Token Ledger & Aliran Settlement.
5. **Laporan Ujian Lengkap (UAT Report)** berserta bukti tangkapan skrin/log transaksi ujian.
6. **Full Backup** (Database & Source Code) serta pemilikan penuh akses Admin, Domain, Hosting, dan akaun berkaitan.

---
> **Pengesahan Pemilik Diperlukan Sebelum Pelaksanaan:**  
> Sila semak dan sahkan dokumen spesifikasi audit & pelan migrasi ini sebelum kerja pengubahsuaian kod dan pangkalan data dimulakan.