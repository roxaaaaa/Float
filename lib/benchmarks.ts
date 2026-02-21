import type { BenchmarkMetricResult, Invoice, Transaction } from "./types";
import { BENCHMARKS } from "./benchmarkData";

function employeeBand(count: number): "1-5" | "6-15" | "16-30" | "31-50" | "50+" {
  if (count <= 5) return "1-5";
  if (count <= 15) return "6-15";
  if (count <= 30) return "16-30";
  if (count <= 50) return "31-50";
  return "50+";
}

function fmtPct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function calculateBenchmarks({
  sector,
  employeeCount,
  payrollAmount,
  currentBalance,
  transactions,
  invoices,
}: {
  sector: keyof typeof BENCHMARKS;
  employeeCount: number;
  payrollAmount: number;
  currentBalance: number;
  transactions: Transaction[];
  invoices: Invoice[];
}) {
  const band = employeeBand(employeeCount);
  const benchmark = BENCHMARKS[sector]?.[band] ?? BENCHMARKS.restaurant["6-15"];

  const monthlyRevenue = Math.max(
    1,
    transactions.filter((t) => t.is_income).reduce((sum, t) => sum + t.amount, 0),
  );
  const monthlyOutgoings = Math.max(
    1,
    transactions.filter((t) => !t.is_income).reduce((sum, t) => sum + Math.abs(t.amount), 0),
  );
  const outstanding = invoices.filter((i) => i.status !== "paid").reduce((sum, i) => sum + i.amount, 0);

  const recurringCostRatio = monthlyOutgoings / monthlyRevenue;
  const cashReserveDays = currentBalance / Math.max(1, Math.floor(monthlyOutgoings / 30));
  const outstandingRatio = outstanding / monthlyRevenue;
  const payrollRatio = payrollAmount / monthlyRevenue;

  const paidInvoices = invoices.filter((i) => Boolean(i.paid_at && i.invoice_date));
  const invoiceDays =
    paidInvoices.length === 0
      ? benchmark.invoice_payment_days
      : Math.round(
          paidInvoices.reduce((sum, inv) => {
            const start = new Date(inv.invoice_date as string).getTime();
            const end = new Date(inv.paid_at as string).getTime();
            return sum + Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
          }, 0) / paidInvoices.length,
        );

  const weeklyIncome: Record<string, number> = {};
  transactions
    .filter((t) => t.is_income)
    .forEach((t) => {
      const week = `${new Date(t.created).getUTCFullYear()}-${Math.ceil(new Date(t.created).getUTCDate() / 7)}`;
      weeklyIncome[week] = (weeklyIncome[week] ?? 0) + t.amount;
    });

  const weekValues = Object.values(weeklyIncome);
  const avg = weekValues.length ? weekValues.reduce((a, b) => a + b, 0) / weekValues.length : monthlyRevenue / 4;
  const variance = weekValues.length
    ? weekValues.reduce((sum, v) => sum + (v - avg) ** 2, 0) / weekValues.length
    : 0;
  const std = Math.sqrt(variance);
  const revenueConsistency = Math.max(0, Math.min(100, Math.round(100 - (std / Math.max(1, avg)) * 100)));

  const results: BenchmarkMetricResult[] = [
    {
      key: "invoice_payment_days",
      label: "Invoice payment time",
      you: `${invoiceDays} days`,
      average: `${benchmark.invoice_payment_days} days`,
      gap: `${invoiceDays - benchmark.invoice_payment_days >= 0 ? "+" : ""}${invoiceDays - benchmark.invoice_payment_days} days`,
      status: invoiceDays > benchmark.invoice_payment_days + 4 ? "red" : invoiceDays > benchmark.invoice_payment_days ? "amber" : "green",
    },
    {
      key: "monthly_recurring_costs",
      label: "Monthly recurring costs",
      you: fmtPct(recurringCostRatio),
      average: fmtPct(benchmark.recurring_cost_ratio),
      gap: `${Math.round((recurringCostRatio - benchmark.recurring_cost_ratio) * 100)}%`,
      status: recurringCostRatio > benchmark.recurring_cost_ratio + 0.08 ? "red" : recurringCostRatio > benchmark.recurring_cost_ratio ? "amber" : "green",
    },
    {
      key: "cash_reserve_days",
      label: "Cash reserve",
      you: `${Math.round(cashReserveDays)} days`,
      average: `${benchmark.cash_reserve_days} days`,
      gap: `${Math.round(cashReserveDays - benchmark.cash_reserve_days)} days`,
      status: cashReserveDays < benchmark.cash_reserve_days - 4 ? "red" : cashReserveDays < benchmark.cash_reserve_days ? "amber" : "green",
    },
    {
      key: "revenue_consistency",
      label: "Revenue consistency",
      you: `${revenueConsistency}/100`,
      average: `${benchmark.revenue_consistency}/100`,
      gap: `${revenueConsistency - benchmark.revenue_consistency >= 0 ? "+" : ""}${revenueConsistency - benchmark.revenue_consistency} pts`,
      status: revenueConsistency < benchmark.revenue_consistency - 5 ? "red" : revenueConsistency < benchmark.revenue_consistency ? "amber" : "green",
    },
    {
      key: "outstanding_invoice_ratio",
      label: "Outstanding invoice ratio",
      you: fmtPct(outstandingRatio),
      average: fmtPct(benchmark.outstanding_invoice_ratio),
      gap: `${Math.round((outstandingRatio - benchmark.outstanding_invoice_ratio) * 100)}%`,
      status: outstandingRatio > benchmark.outstanding_invoice_ratio + 0.05 ? "red" : outstandingRatio > benchmark.outstanding_invoice_ratio ? "amber" : "green",
    },
    {
      key: "payroll_to_revenue",
      label: "Payroll to revenue",
      you: fmtPct(payrollRatio),
      average: fmtPct(benchmark.payroll_to_revenue_ratio),
      gap: `${Math.round((payrollRatio - benchmark.payroll_to_revenue_ratio) * 100)}%`,
      status: payrollRatio > benchmark.payroll_to_revenue_ratio + 0.06 ? "red" : payrollRatio > benchmark.payroll_to_revenue_ratio ? "amber" : "green",
    },
  ];

  const worst = results.filter((m) => m.status !== "green")[0];
  const insight = worst
    ? `${worst.label} is your highest-priority gap versus ${sector} peers (${band}). Improving this first will reduce payroll risk fastest.`
    : `Your metrics are outperforming ${sector} peers (${band}) overall. Preserve cash reserve discipline to keep risk low.`;

  return { results, insight, sector, band };
}
