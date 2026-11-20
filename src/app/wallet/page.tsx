import { redirect } from "next/navigation";
import { getWalletDataAction } from "./actions";
import { WalletView } from "./WalletView";

export default async function WalletPage() {
  const data = await getWalletDataAction();

  if (data.error || !data.user) {
    redirect("/login");
  }

  return (
    <WalletView
      user={data.user}
      profile={data.profile}
      currentBalance={data.currentBalance}
      totalEarned={data.totalEarned}
      totalRedeemed={data.totalRedeemed}
      transactions={data.transactions}
    />
  );
}

