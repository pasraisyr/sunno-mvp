import { redirect } from "next/navigation";
import { getMerchantDashboardData } from "../actions";
import { MerchantDashboardView } from "./MerchantDashboardView";

export default async function MerchantDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string }>;
}) {
  const params = await searchParams;
  const isPaid = params.paid === "true";
  const data = await getMerchantDashboardData(isPaid);

  if (data.error || !data.user) {
    redirect("/login");
  }

  return (
    <MerchantDashboardView
      user={data.user}
      profile={data.profile}
      merchant={data.merchant}
      products={data.products}
      orders={data.orders || []}
      categories={data.categories}
    />
  );
}