export interface TokenLedgerItem {
  id: string;
  amount: number | string;
  type: "EARNED" | "REDEEMED" | "ADJUSTMENT";
  reference_id?: string | null;
  description?: string | null;
  created_at: string;
}

export interface WalletViewProps {
  user: { id: string; email?: string } | null;
  profile: { full_name?: string | null; phone_number?: string | null } | null;
  currentBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  transactions: TokenLedgerItem[];
}

