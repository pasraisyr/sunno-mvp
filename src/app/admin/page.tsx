import { redirect } from "next/navigation";
import { getAdminDashboardDataAction } from "./actions";
import { AdminDashboardView } from "./AdminDashboardView";

export default async function AdminPage() {
  const data = await getAdminDashboardDataAction();

  if (data.error || !data.user) {
    redirect("/login");
  }

  return (
    <AdminDashboardView
      user={data.user}
      isAdmin={data.isAdmin || false}
      stats={
        data.stats || {
          totalPioneerFeesRm: 0,
          totalCompanyShareRm: 0,
          totalHqRevenueRm: 0,
          totalGmvRm: 0,
          totalOrdersCount: 0,
          totalActiveMerchants: 0,
          totalUsersCount: 0,
          totalTokensIssued: 0,
        }
      }
      merchants={data.merchants || []}
      users={data.users || []}
      orders={data.orders || []}
    />
  );
}

