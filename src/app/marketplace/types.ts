export interface CartItem {
  productId: string;
  productTitle: string;
  price: number;
  merchantId: string;
  merchantName: string;
  quantity: number;
}

export interface ProductItem {
  id: string;
  title: string;
  description?: string | null;
  price_rm: string | number;
  category_id?: string | null;
  merchants: {
    id: string;
    shop_name: string;
    slug: string;
    is_active: boolean;
    token_discount_enabled?: boolean;
    max_token_discount_percent?: number;
  };
  categories?: {
    id: string;
    name: string;
  } | null;
}

export interface CategoryItem {
  id: string;
  name: string;
}

export interface MarketplaceViewProps {
  user: { id: string; email?: string } | null;
  profile?: {
    id: string;
    fullName: string;
    role: "USER" | "AGEN_PROMOTER" | "MERCHANT" | "ADMIN" | string;
  } | null;
  products: ProductItem[];
  categories: CategoryItem[];
  userTokens: number;
  completedOrder: {
    id: string;
    cash_paid_rm: number | string;
  } | null;
}
