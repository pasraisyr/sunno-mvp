-- 1. CATEGORIES TABLE & SAMBUNG KE PRODUCTS
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tambah kolum category_id ke dalam jadual products yang dah wujud
ALTER TABLE products
ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- 2. ORDER ITEMS TABLE (Senarai barang & kuantiti dalam setiap resit order)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_rm NUMERIC(10, 2) NOT NULL,
    subtotal_rm NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. NETWORK TREES TABLE (Merakam ikatan Referral L1, L2, L3)
CREATE TABLE network_trees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,     -- Downline (Ahli)
    ancestor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- Upline (Penaja L1/L2/L3)
    tier tier_level NOT NULL,                                            -- Guna ENUM ('L1', 'L2', 'L3')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, ancestor_id),
    UNIQUE(user_id, tier)
);

-- 4. PAYOUTS TABLE (Rekod pengeluaran duit komisen ke bank)
CREATE TYPE payout_status AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');

CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount_rm NUMERIC(10, 2) NOT NULL CHECK (amount_rm > 0),
    bank_name TEXT NOT NULL,
    bank_account_number TEXT NOT NULL,
    bank_account_holder TEXT NOT NULL,
    status payout_status DEFAULT 'PENDING' NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);