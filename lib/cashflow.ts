import { addDays, formatISO } from "date-fns";
import type { Projection, Transaction, Invoice } from "./types";

export function projectCashflow({
  currentBalancePence,
  payrollAmountPence,
  payrollDay = "friday",
  transactions,
  invoices,
}: {
  currentBalancePence: number;
  payrollAmountPence: number;
  payrollDay?: string;
  transactions: Transaction[];
  invoices: Invoice[];
}): Projection[] {
  const outflows = transactions.filter((t) => !t.is_income).map((t) => Math.abs(t.amount));
  const inflows = transactions.filter((t) => t.is_income).map((t) => t.amount);

  const avgDailyOutflow = Math.max(1, Math.round(outflows.reduce((sum, v) => sum + v, 0) / Math.max(outflows.length, 1)));
  const avgDailyInflow = Math.round(inflows.reduce((sum, v) => sum + v, 0) / Math.max(inflows.length, 1));
  const netDaily = avgDailyInflow - avgDailyOutflow;

  const overdueExpected = invoices.filter((i) => i.status === "overdue" || i.status === "chasing").reduce((sum, i) => sum + i.amount, 0);

  const today = new Date();
  let rolling = currentBalancePence;

  return Array.from({ length: 30 }).map((_, idx) => {
    const date = addDays(today, idx + 1);
    rolling += netDaily;

    if (idx === 3) rolling += Math.round(overdueExpected * 0.4);
    if (idx === 10) rolling += Math.round(overdueExpected * 0.2);

    if (date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() === payrollDay.toLowerCase() && idx < 8) {
      rolling -= payrollAmountPence;
    }

    return {
      projection_date: formatISO(date, { representation: "date" }),
      projected_balance: rolling,
      is_below_payroll_threshold: rolling < payrollAmountPence,
      is_below_zero: rolling < 0,
      confidence_score: 0.78,
    };
  });
}

export function summarizeRisk(projections: Projection[], payrollAmount: number) {
  const belowZeroIndex = projections.findIndex((p) => p.projected_balance < 0);
  const belowPayrollIndex = projections.findIndex((p) => p.projected_balance < payrollAmount);

  if (belowPayrollIndex === -1) {
    return {
      risk_level: "healthy" as const,
      payroll_at_risk: false,
      payroll_shortfall: null,
      days_until_negative: belowZeroIndex === -1 ? null : belowZeroIndex + 1,
      days_until_below_payroll: null,
    };
  }

  const shortfall = Math.max(0, payrollAmount - projections[belowPayrollIndex].projected_balance);
  return {
    risk_level: belowPayrollIndex < 7 ? ("critical" as const) : ("warning" as const),
    payroll_at_risk: true,
    payroll_shortfall: shortfall,
    days_until_negative: belowZeroIndex === -1 ? null : belowZeroIndex + 1,
    days_until_below_payroll: belowPayrollIndex + 1,
  };
}
