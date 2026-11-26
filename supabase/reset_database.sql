-- ================================================================
-- MORRA.ASIA — SKRIP RESET PANGKALAN DATA (CLEAN SLATE & MORRA FASA 1)
-- ================================================================
-- Jalankan skrip ini dalam Supabase Dashboard -> SQL Editor
-- untuk mengosongkan semua data ujian dan memulakan dari awal.
-- ================================================================

-- 1. Kosongkan semua jadual sedia ada secara selamat (hanya jika jadual wujud)
DO $$ 
DECLARE 
  tbl TEXT;
  tables_to_truncate TEXT[] := ARRAY[
    'commission_ledgers', 'commissions', 'order_items', 'orders', 
    'token_ledger', 'network_trees', 'payouts', 'products', 
    'merchants', 'profiles'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_to_truncate LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      EXECUTE format('TRUNCATE TABLE public.%I CASCADE', tbl);
    END IF;
  END LOOP;
END $$;

-- 2. Kosongkan akaun log masuk Supabase Auth lama (jika ada)
DELETE FROM auth.users;

-- ================================================================
-- PASTIKAN STRUKTUR MORRA FASA 1 TERSEDIA LENGKAP
-- ================================================================

-- Role Pengguna MORRA: ADMIN, AGEN_PROMOTER, MERCHANT, USER
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role' AND udt_name = 'user_role'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN role TYPE VARCHAR(20) USING role::text;
  END IF;
END $$;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('ADMIN', 'AGEN_PROMOTER', 'MERCHANT', 'USER'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referred_by_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS referred_by_role VARCHAR(20);

-- Kolum Pioneer & Diskaun Token pada Merchants
ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS pioneer_payment_status VARCHAR(20) DEFAULT 'UNPAID' 
    CHECK (pioneer_payment_status IN ('UNPAID', 'PENDING', 'PAID', 'REVOKED')),
  ADD COLUMN IF NOT EXISTS pioneer_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pioneer_payment_ref VARCHAR(100),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS referred_by_promoter_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS token_discount_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS max_token_discount_percent NUMERIC(5,2) DEFAULT 0.00;

-- Jadual Konfigurasi Dinamik
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
  ('TOKEN_EARN_RATE', '{"rm_per_token": 1}', 'Kadar rasmi: RM1 = 1 Token'),
  ('CHIP_FEE_CONFIG', '{"percent": 1.0, "min_fee_rm": 0.15, "max_fee_rm": 1.50}', 'Caj CHIP Gateway: 1% (min RM0.15, max RM1.50) terpisah daripada fi MORRA 5%')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Kolum Pecahan Settlement pada Orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS gross_amount NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS token_discount_amount NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS chip_gateway_fee NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS morra_platform_fee NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS promoter_commission NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS referrer_merchant_commission NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS morra_net_revenue NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS merchant_net_amount NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS commission_processed BOOLEAN DEFAULT FALSE;

-- Jadual Rekod Agihan Komisen 2-Level (Audit Trail & Anti-Duplicate)
CREATE TABLE IF NOT EXISTS public.commission_ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  scenario_type VARCHAR(20) NOT NULL CHECK (scenario_type IN ('SCENARIO_A', 'SCENARIO_B', 'SCENARIO_C', 'NO_REFERRAL')),
  recipient_id UUID REFERENCES public.profiles(id),
  recipient_role VARCHAR(20) NOT NULL CHECK (recipient_role IN ('AGEN_PROMOTER', 'MERCHANT', 'MORRA')),
  network_level INT CHECK (network_level IN (0, 1, 2)),
  platform_fee_base NUMERIC(12,2) NOT NULL,
  percentage_allocated NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'CREDITED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id, recipient_role, network_level)
);

-- ================================================================
-- CIPTA AKAUN SUPERADMIN TERUS DALAM SQL (MORRA HQ):
-- ================================================================
DO $$
DECLARE
  new_admin_id UUID := gen_random_uuid();
  -- ----------------------------------------------------------------
  -- TETAPKAN KREDENSIAL ADMIN ANDA DI BAWAH SEBELUM MENJALANKAN SKRIP
  -- ----------------------------------------------------------------
  admin_email TEXT := 'admin@example.com'; -- Gantikan dengan emel rasmi anda
  admin_password TEXT := 'GantikanPasswordAdmin123!'; -- Gantikan dengan kata laluan pilihan anda
  admin_name TEXT := 'MORRA Superadmin (HQ)';
  admin_phone TEXT := '01XXXXXXXX';
BEGIN
  -- Padam rekod lama jika ada untuk mengelakkan percanggahan
  DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE email = admin_email);
  DELETE FROM auth.users WHERE email = admin_email;
  DELETE FROM public.profiles WHERE id = new_admin_id;

  -- Masukkan ke auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token
  ) VALUES (
    new_admin_id,
    '00000000-0000-0000-0000-000000000000',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    json_build_object('full_name', admin_name)::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    ''
  );

  -- Masukkan ke auth.identities (WAJIB untuk login emel Supabase GoTrue)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_admin_id,
    new_admin_id,
    json_build_object('sub', new_admin_id::text, 'email', admin_email)::jsonb,
    'email',
    new_admin_id::text,
    NOW(),
    NOW(),
    NOW()
  );

  -- Masukkan ke profiles sebagai ADMIN
  INSERT INTO public.profiles (
    id,
    full_name,
    phone_number,
    role,
    is_pioneer_merchant
  ) VALUES (
    new_admin_id,
    admin_name,
    admin_phone,
    'ADMIN',
    false
  );
END $$;

-- Nota: Gantikan admin_email dan admin_password dalam skrip di atas 
-- sebelum dijalankan di Supabase SQL Editor.
