"use client";

import { useMemo, useState } from "react";

import type { Account, AIInsight, Incident, Invoice, Projection } from "@/lib/types";
import { calculateBenchmarks } from "@/lib/benchmarks";
import type { Transaction } from "@/lib/types";
import { BalanceCard } from "./BalanceCard";
import { BenchmarkPanel } from "./BenchmarkPanel";
import { CashflowChart } from "./CashflowChart";
import { CrisisBanner } from "./CrisisBanner";
import { FixItModal } from "./FixItModal";
import { InsightsPanel } from "./InsightsPanel";
import { InvoiceTable } from "./InvoiceTable";
import { InvoicesCard } from "./InvoicesCard";
import { PayrollCard } from "./PayrollCard";
import { RunwayCard } from "./RunwayCard";

export function DashboardView({
  account,
  invoices,
  insights,
  projections,
  incidents,
  transactions,
}: {
  account: Account;
  invoices: Invoice[];
  insights: AIInsight[];
  projections: Projection[];
  incidents: Incident[];
  transactions: Transaction[];
}) {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(incidents[0] ?? null);
  const [fixItOpen, setFixItOpen] = useState(false);
  const [localInsights, setLocalInsights] = useState(insights);

  const outstanding = invoices.filter((i) => i.status !== "paid").reduce((sum, i) => sum + i.amount, 0);
  const overdue = invoices.filter((i) => i.status === "overdue").length;
  const runwayDays = useMemo(() => {
    const firstNegative = projections.findIndex((p) => p.is_below_zero);
    return firstNegative === -1 ? 47 : firstNegative + 1;
  }, [projections]);

  const benchmark = calculateBenchmarks({
    sector: (account.sector as "restaurant") || "restaurant",
    employeeCount: account.employee_count,
    payrollAmount: account.payroll_amount,
    currentBalance: account.latest_balance_pence,
    transactions,
    invoices,
  });

  async function dismissInsight(insight: AIInsight) {
    setLocalInsights((prev) => prev.filter((i) => i.id !== insight.id));
    await fetch("/api/claude/analyze", { method: "POST" }).catch(() => undefined);
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <section className="rounded-xl border border-border/70 bg-card/30 p-4 md:p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">CFO Command Centre</p>
        <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
          {account.business_name}, here&apos;s your <span className="text-gradient">live financial posture</span>.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Updated continuously from Monzo, invoices, and active incident streams.
        </p>
      </section>

      <CrisisBanner
        riskLevel={account.risk_level}
        runwayDays={runwayDays}
        shortfall={account.payroll_shortfall}
        onFixIt={() => {
          setSelectedIncident(incidents[0] ?? null);
          setFixItOpen(true);
        }}
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <BalanceCard amount={account.latest_balance_pence} trendPercent={2.1} />
        <PayrollCard payrollAmount={account.payroll_amount} shortfall={account.payroll_shortfall} payrollDay={account.payroll_day} />
        <InvoicesCard outstanding={outstanding} count={invoices.length} overdue={overdue} />
        <RunwayCard days={runwayDays} />
      </section>

      <CashflowChart projections={projections} payrollThreshold={account.payroll_amount} />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <InvoiceTable
            invoices={invoices}
            onChase={() => {
              setSelectedIncident(incidents[0] ?? null);
              setFixItOpen(true);
            }}
            onSendLink={async (invoice) => {
              await fetch("/api/stripe/payment-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  invoice_id: invoice.id,
                  client_name: invoice.client_name,
                  invoice_number: invoice.invoice_number,
                  amount_pence: invoice.amount,
                }),
              });
            }}
          />
        </div>
        <div className="xl:col-span-2">
          <InsightsPanel insights={localInsights} onDismiss={dismissInsight} />
        </div>
      </section>

      <BenchmarkPanel rows={benchmark.results} title={`${benchmark.sector} ${benchmark.band}`} />

      <FixItModal open={fixItOpen} onOpenChange={setFixItOpen} incident={selectedIncident} />
    </div>
  );
}
