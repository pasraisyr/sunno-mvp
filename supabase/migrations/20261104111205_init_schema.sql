
-- 1. PROFILES TABLE (Handles Users, Merchants, Networkers, Admin)
CREATE TYPE user_role AS ENUM ('CONSUMER', 'MERCHANT', 'ADMIN');

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'CONSUMER',
    sponsor_id UUID REFERENCES profiles(id), -- Direct Referral (Sponsor)
    is_pioneer_merchant BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. MERCHANTS TABLE
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    shop_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    address TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT FALSE, -- Active after RM512 payment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. PRODUCTS TABLE
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price_rm NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. ORDERS TABLE
CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'COMPLETED');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    merchant_id UUID REFERENCES merchants(id) NOT NULL,
    total_amount_rm NUMERIC(10, 2) NOT NULL,
    tokens_used NUMERIC(10, 2) DEFAULT 0,
    cash_paid_rm NUMERIC(10, 2) NOT NULL,
    chip_purchase_id TEXT,
    status order_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TOKEN LEDGER TABLE (SEPARATE ACCOUNT FROM FIAT MONEY)
CREATE TYPE token_tx_type AS ENUM ('EARNED', 'REDEEMED', 'ADJUSTMENT');

CREATE TABLE token_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type token_tx_type NOT NULL,
    reference_id UUID, -- Links to order_id if applicable
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. NETWORKING COMMISSIONS TABLE (3-TIER SYSTEM)
CREATE TYPE tier_level AS ENUM ('L1', 'L2', 'L3');

CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    beneficiary_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    tier tier_level NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    amount_rm NUMERIC(10, 2) NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
