export interface NetworkMemberItem {
  userId: string;
  fullName: string;
  phoneNumber?: string | null;
  role: string;
  tier: "L1" | "L2" | "L3";
  createdAt: string;
}

export interface CommissionRecordItem {
  id: string;
  orderId: string;
  tier: "L1" | "L2" | "L3";
  percentage: number;
  amountRm: number;
  isPaid: boolean;
  createdAt: string;
}

export interface NetworkDashboardViewProps {
  user: { id: string; email?: string } | null;
  profile: { full_name?: string | null } | null;
  referralLink: string;
  referralCode: string;
  totalCommissionsRm: number;
  unpaidCommissionsRm: number;
  paidCommissionsRm: number;
  l1Count: number;
  l2Count: number;
  l3Count: number;
  members: NetworkMemberItem[];
  commissions: CommissionRecordItem[];
}

