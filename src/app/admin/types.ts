export interface AdminMerchantItem {
  id: string;
  shopName: string;
  slug: string;
  ownerName: string;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  isActive: boolean;
  pioneerFeePaidRm: number;
  createdAt: string;
}

export interface AdminUserItem {
  id: string;
  fullName: string;
  phoneNumber?: string | null;
  role: "CONSUMER" | "MERCHANT" | "ADMIN";
  sponsorName?: string | null;
  createdAt: string;
}

export interface AdminOrderItem {
  id: string;
  customerName: string;
  shopName: string;
  totalAmountRm: number;
  tokensUsed: number;
  cashPaidRm: number;
  platformFeeRm: number;
  merchantNetRm: number;
  status: string;
  createdAt: string;
}

export interface AdminDashboardViewProps {
  user: { id: string; email?: string };
  isAdmin: boolean;
  stats: {
    totalPioneerFeesRm: number; // Kutipan Pakej Pioneer RM512
    totalCompanyShareRm: number; // Bahagian Syarikat 22.5% Pool
    totalHqRevenueRm: number; // Jumlah Hasil Bersih HQ
    totalGmvRm: number; // GMV Kasar Pasaran (Jualan Peniaga)
    totalOrdersCount: number;
    totalActiveMerchants: number;
    totalUsersCount: number;
    totalTokensIssued: number;
  };
  merchants: AdminMerchantItem[];
  users: AdminUserItem[];
  orders: AdminOrderItem[];
}
