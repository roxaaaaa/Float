import { AppShell } from "@/components/layout/AppShell";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { getDashboardData, getViewerAndAccount } from "@/lib/data";

export default async function DashboardPage() {
  const { account } = await getViewerAndAccount();
  const data = await getDashboardData(account.id);

  return (
    <AppShell title="Dashboard" businessName={account.business_name} monzoConnected={account.monzo_connected}>
      <DashboardView
        account={account}
        invoices={data.invoices}
        insights={data.insights}
        projections={data.projections}
        incidents={data.incidents}
        transactions={data.transactions}
      />
    </AppShell>
  );
}
