-- Tambah kolum caj pengurusan platform & simpanan data split settlement
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS platform_fee_rm NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS merchant_net_rm NUMERIC(10, 2) DEFAULT 0;

