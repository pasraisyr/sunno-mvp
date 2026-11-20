-- ================================================================
-- SUNNO.ASIA — SKRIP RESET PANGKALAN DATA (CLEAN SLATE)
-- ================================================================
-- Jalankan skrip ini dalam Supabase Dashboard -> SQL Editor
-- untuk mengosongkan semua data ujian dan memulakan dari awal.
-- ================================================================

-- 1. Kosongkan semua jadual transaksi, pesanan & lejar
TRUNCATE TABLE commissions CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE token_ledger CASCADE;
TRUNCATE TABLE network_trees CASCADE;
TRUNCATE TABLE payouts CASCADE;

-- 2. Kosongkan jadual produk & kedai peniaga
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE merchants CASCADE;

-- 3. Kosongkan profil pengguna
TRUNCATE TABLE profiles CASCADE;

-- 4. Kosongkan akaun log masuk Supabase Auth
DELETE FROM auth.users;

-- ================================================================
-- SELESAI RESET: Pangkalan data kini 100% bersih!
-- ================================================================

-- 5. CIPTA AKAUN SUPERADMIN TERUS DALAM SQL (Pantas & Bebas Ralat Network):
DO $$
DECLARE
  new_admin_id UUID := gen_random_uuid();
BEGIN
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
    aud
  ) VALUES (
    new_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@sunno.asia',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sunno Superadmin (HQ)"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
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
    'Sunno Superadmin (HQ)',
    '0123456789',
    'ADMIN',
    false
  );
END $$;

-- Maklumat log masuk yang telah dicipta:
-- Emel:        admin@sunno.asia
-- Kata Laluan: Password123!
-- Peranan:     ADMIN (Akses penuh ke http://localhost:3000/admin)

