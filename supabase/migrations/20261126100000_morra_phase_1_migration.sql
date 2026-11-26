-- ============================================================================
-- MIGRATION: SUNNO MVP TO MORRA PHASE 1
-- File: supabase/migrations/20261126100000_morra_phase_1_migration.sql
-- ============================================================================

BEGIN;

-- 1. Kemas kini Enum / Kekangan Role Pengguna (AGEN_PROMOTER, MERCHANT, USER, ADMIN)
DO $$
BEGIN
  -- Jika role menggunakan enum user_role, tukar ke VARCHAR terlebih dahulu
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role' AND udt_name = 'user_role') THEN
    ALTER TABLE public.profiles ALTER COLUMN role TYPE VARCHAR(20) USING role::text;
  END IF;
END $$;

ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_role_check;

UPDATE public.profiles 
  SET role = 'USER' 
  WHERE role = 'CONSUMER';

UPDATE public.profiles 
  SET role = 'AGEN_PROMOTER' 
  WHERE role IN ('PARTNER', 'NETWORKER');

ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('ADMIN', 'AGEN_PROMOTER', 'MERCHANT', 'USER'));

-- Tambah kolum referral 2-level pada profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referred_by_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS referred_by_role VARCHAR(20);

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

-- Selaraskan rekod sedia ada: jika merchant aktif, set pioneer_payment_status = 'PAID'
UPDATE public.merchants
SET 
  pioneer_payment_status = 'PAID',
  is_active = TRUE
WHERE is_active = TRUE;

-- 3. Jadual Konfigurasi Dinamik MORRA (Fi 5% & Kadar Token)
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

-- 4. Pecahan Lejar Kewangan & Settlement pada Orders
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

-- Selaraskan kolum sedia ada orders
UPDATE public.orders
SET 
  gross_amount = COALESCE(total_amount_rm, 0.00),
  morra_platform_fee = COALESCE(platform_fee_rm, 0.00),
  merchant_net_amount = COALESCE(merchant_net_rm, 0.00)
WHERE gross_amount = 0.00 AND total_amount_rm IS NOT NULL;

-- 5. Jadual Rekod Agihan Komisen 2-Level (Audit Trail & Anti-Duplicate)
CREATE TABLE IF NOT EXISTS public.commission_ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  scenario_type VARCHAR(20) NOT NULL CHECK (scenario_type IN ('SCENARIO_A', 'SCENARIO_B', 'SCENARIO_C', 'NO_REFERRAL')),
  recipient_id UUID REFERENCES public.profiles(id), -- NULL jika bahagian MORRA HQ
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
