import { getMarketplaceData } from "./actions";
import { MarketplaceView } from "./MarketplaceView";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string; paid?: string }>;
}) {
  const params = await searchParams;
  const completedOrderId = params.paid === "true" ? params.order_id : undefined;

  const data = await getMarketplaceData(completedOrderId);

  return (
    <MarketplaceView
      user={data.user}
      profile={data.profile}
      products={data.products}
      categories={data.categories}
      userTokens={data.userTokens}
      completedOrder={data.completedOrder}
    />
  );
}