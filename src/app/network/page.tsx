import { redirect } from "next/navigation";
import { getNetworkDashboardDataAction } from "./actions";
import { NetworkView } from "./NetworkView";

export default async function NetworkPage() {
  const data = await getNetworkDashboardDataAction();

  if (data.error || !data.user) {
    redirect("/login");
  }

  return (
    <NetworkView
      user={data.user}
      profile={data.profile}
      isUserRestricted={data.isUserRestricted}
      referralLink={data.referralLink}
      referralCode={data.referralCode}
      totalCommissionsRm={data.totalCommissionsRm}
      unpaidCommissionsRm={data.unpaidCommissionsRm}
      paidCommissionsRm={data.paidCommissionsRm}
      l1Count={data.l1Count}
      l2Count={data.l2Count}
      members={data.members}
      commissions={data.commissions}
    />
  );
}
