export interface OrderItem {
  id: string;
  quantity: number;
  subtotal_rm: string | number;
  products?: { title: string } | null;
}

export interface OrderRecord {
  id: string;
  status: "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";
  total_amount_rm: string | number;
  profiles?: {
    full_name?: string | null;
    phone_number?: string | null;
  } | null;
  order_items?: OrderItem[];
}

export interface ProductRecord {
  id: string;
  title: string;
  price_rm: string | number;
  categories?: { name: string } | null;
}

export interface CategoryRecord {
  id: string;
  name: string;
}

export interface MerchantDashboardViewProps {
  user: { id: string; email?: string } | null;
  profile: {
    full_name?: string | null;
    role?: "CONSUMER" | "MERCHANT" | "ADMIN" | string | null;
  } | null;
  merchant: {
    id: string;
    shop_name: string;
    slug: string;
    description?: string | null;
    address?: string | null;
    is_active: boolean;
    pioneer_payment_status?: "UNPAID" | "PENDING" | "PAID" | "REVOKED" | string | null;
    token_discount_enabled?: boolean;
    max_token_discount_percent?: number;
  } | null;
  products?: ProductRecord[];
  orders?: OrderRecord[];
  categories?: CategoryRecord[];
}

