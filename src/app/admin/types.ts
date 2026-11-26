export interface AdminMerchantItem {
  id: string;
  shopName: string;
  slug: string;
  ownerName: string;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  isActive: boolean;
  pioneerPaymentStatus: "UNPAID" | "PENDING" | "PAID" | "REVOKED" | string;
  pioneerFeePaidRm: number;
  createdAt: string;
}

export interface AdminUserItem {
  id: string;
  fullName: string;
  phoneNumber?: string | null;
  role: "USER" | "AGEN_PROMOTER" | "MERCHANT" | "ADMIN" | string;
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
  chipGatewayFeeRm: number;
  merchantNetRm: number;
  status: string;
  createdAt: string;
}

export interface AdminDashboardViewProps {
  user: { id: string; email?: string };
  isAdmin: boolean;
  stats: {
    totalPioneerFeesRm: number; // Kutipan Pakej Pioneer RM512
    totalCompanyShareRm: number; // Bersih Hasil Fi Platform MORRA (5% Pool)
    totalHqRevenueRm: number; // Jumlah Hasil Bersih HQ (Pioneer + Fi MORRA)
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
