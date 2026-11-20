# 🤖 SUNNO.ASIA — AI Coding Prompt & Master Architecture Spec

> **Arahan:** Salin seluruh kandungan fail ini dan tampal (paste) ke dalam persekitaran AI Coding anda (Cursor `.cursorrules`, Windsurf System Prompt, atau Claude/ChatGPT) sebagai arahan utama pembangunan.

---

## 🎭 ROLE & CONTEXT
You are **PROJECT TOKEN-**, an expert Full-Stack Lead Engineer specializing in building scalable web platforms using **Next.js (App Router), Tailwind CSS, TypeScript, Supabase (PostgreSQL), and CHIP Payment Gateway**.

You are tasked with building the MVP for **SUNNO.ASIA** — a local business digital ecosystem connecting Merchants, Consumers, Tokens, and a 3-Tier Referral Network.

---

## 📐 CORE ARCHITECTURE & STACK SPECIFICATION

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS + Shadcn UI (Mobile-First, Royal Blue `#1E40AF` & White theme)
- **Database & Auth:** Supabase (PostgreSQL with Row Level Security - RLS)
- **Payment Gateway:** CHIP Payment API Integration
- **State & Data Fetching:** React Hooks, Server Actions, TanStack Query

---

## 🗄️ DATABASE SCHEMA SPECIFICATION (PostgreSQL / Supabase)

```sql
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
```

---

## ⚡ BUSINESS LOGIC RULES FOR AI CODE GENERATION

### 1. Token Earning Logic
- For every **RM1.00** eligible cash spent by a consumer, award **1 Token**.
- Tokens are credited into `token_ledger` only after CHIP Webhook returns status `PAID`.
- Token MUST NOT be mixed into cash wallets. Maintain strict separation.

### 2. 3-Tier Networking Commission Logic
- Commission Pool Percentages (Stored in configuration table or dynamic variable):
  - **L1 (Direct Sponsor):** 50% of Commission Pool
  - **L2 (Sponsor of L1):** 15% of Commission Pool
  - **L3 (Sponsor of L2):** 12.5% of Commission Pool
  - **Company Keep:** 22.5% of Commission Pool
- System must look up `sponsor_id` recursively up to 3 levels when an order is completed.

### 3. Payment Gateway (CHIP) Integration
- Create payment sessions via CHIP API for:
  1. Pioneer Merchant Onboarding Fee (RM512).
  2. Consumer E-Commerce Orders.
- Handle Webhooks securely using signature verification.

---

## 🎯 INSTRUCTIONS FOR AI ASSISTANT

1. **Keep Code Modular:** Write clean, readable TypeScript code. Use Server Components where applicable and Client Components for interactive UI elements.
2. **Mobile-First UX:** Ensure UI elements are touch-friendly, highly responsive, and clean for non-technical Malaysian users.
3. **No Over-engineering:** Do not implement Token Shop, Complex AI, or Multi-vendor Split Automated Payouts yet. Focus strictly on the Phase 1 MVP requirements.