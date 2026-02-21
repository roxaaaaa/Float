export interface IndustryBenchmark {
  invoice_payment_days: number;
  recurring_cost_ratio: number;
  cash_reserve_days: number;
  revenue_consistency: number;
  outstanding_invoice_ratio: number;
  payroll_to_revenue_ratio: number;
}

type Sector = "restaurant" | "agency" | "clinic" | "construction" | "retail";
type Band = "1-5" | "6-15" | "16-30" | "31-50" | "50+";

export const BENCHMARKS: Record<Sector, Record<Band, IndustryBenchmark>> = {
  restaurant: {
    "1-5": { invoice_payment_days: 24, recurring_cost_ratio: 0.56, cash_reserve_days: 14, revenue_consistency: 65, outstanding_invoice_ratio: 0.1, payroll_to_revenue_ratio: 0.32 },
    "6-15": { invoice_payment_days: 22, recurring_cost_ratio: 0.58, cash_reserve_days: 18, revenue_consistency: 68, outstanding_invoice_ratio: 0.12, payroll_to_revenue_ratio: 0.31 },
    "16-30": { invoice_payment_days: 21, recurring_cost_ratio: 0.57, cash_reserve_days: 20, revenue_consistency: 69, outstanding_invoice_ratio: 0.11, payroll_to_revenue_ratio: 0.3 },
    "31-50": { invoice_payment_days: 20, recurring_cost_ratio: 0.56, cash_reserve_days: 21, revenue_consistency: 70, outstanding_invoice_ratio: 0.1, payroll_to_revenue_ratio: 0.29 },
    "50+": { invoice_payment_days: 19, recurring_cost_ratio: 0.55, cash_reserve_days: 23, revenue_consistency: 71, outstanding_invoice_ratio: 0.09, payroll_to_revenue_ratio: 0.28 },
  },
  agency: {
    "1-5": { invoice_payment_days: 35, recurring_cost_ratio: 0.42, cash_reserve_days: 23, revenue_consistency: 61, outstanding_invoice_ratio: 0.2, payroll_to_revenue_ratio: 0.42 },
    "6-15": { invoice_payment_days: 32, recurring_cost_ratio: 0.45, cash_reserve_days: 25, revenue_consistency: 63, outstanding_invoice_ratio: 0.18, payroll_to_revenue_ratio: 0.41 },
    "16-30": { invoice_payment_days: 31, recurring_cost_ratio: 0.44, cash_reserve_days: 26, revenue_consistency: 65, outstanding_invoice_ratio: 0.17, payroll_to_revenue_ratio: 0.4 },
    "31-50": { invoice_payment_days: 29, recurring_cost_ratio: 0.43, cash_reserve_days: 28, revenue_consistency: 67, outstanding_invoice_ratio: 0.16, payroll_to_revenue_ratio: 0.39 },
    "50+": { invoice_payment_days: 28, recurring_cost_ratio: 0.42, cash_reserve_days: 30, revenue_consistency: 69, outstanding_invoice_ratio: 0.15, payroll_to_revenue_ratio: 0.38 },
  },
  clinic: {
    "1-5": { invoice_payment_days: 18, recurring_cost_ratio: 0.5, cash_reserve_days: 21, revenue_consistency: 73, outstanding_invoice_ratio: 0.08, payroll_to_revenue_ratio: 0.28 },
    "6-15": { invoice_payment_days: 17, recurring_cost_ratio: 0.49, cash_reserve_days: 23, revenue_consistency: 74, outstanding_invoice_ratio: 0.08, payroll_to_revenue_ratio: 0.27 },
    "16-30": { invoice_payment_days: 16, recurring_cost_ratio: 0.48, cash_reserve_days: 25, revenue_consistency: 75, outstanding_invoice_ratio: 0.07, payroll_to_revenue_ratio: 0.26 },
    "31-50": { invoice_payment_days: 15, recurring_cost_ratio: 0.47, cash_reserve_days: 26, revenue_consistency: 76, outstanding_invoice_ratio: 0.07, payroll_to_revenue_ratio: 0.25 },
    "50+": { invoice_payment_days: 14, recurring_cost_ratio: 0.46, cash_reserve_days: 28, revenue_consistency: 77, outstanding_invoice_ratio: 0.06, payroll_to_revenue_ratio: 0.25 },
  },
  construction: {
    "1-5": { invoice_payment_days: 41, recurring_cost_ratio: 0.52, cash_reserve_days: 16, revenue_consistency: 59, outstanding_invoice_ratio: 0.22, payroll_to_revenue_ratio: 0.27 },
    "6-15": { invoice_payment_days: 38, recurring_cost_ratio: 0.53, cash_reserve_days: 17, revenue_consistency: 60, outstanding_invoice_ratio: 0.21, payroll_to_revenue_ratio: 0.27 },
    "16-30": { invoice_payment_days: 36, recurring_cost_ratio: 0.52, cash_reserve_days: 18, revenue_consistency: 61, outstanding_invoice_ratio: 0.2, payroll_to_revenue_ratio: 0.26 },
    "31-50": { invoice_payment_days: 34, recurring_cost_ratio: 0.51, cash_reserve_days: 19, revenue_consistency: 62, outstanding_invoice_ratio: 0.19, payroll_to_revenue_ratio: 0.26 },
    "50+": { invoice_payment_days: 33, recurring_cost_ratio: 0.5, cash_reserve_days: 20, revenue_consistency: 63, outstanding_invoice_ratio: 0.18, payroll_to_revenue_ratio: 0.25 },
  },
  retail: {
    "1-5": { invoice_payment_days: 20, recurring_cost_ratio: 0.61, cash_reserve_days: 11, revenue_consistency: 64, outstanding_invoice_ratio: 0.09, payroll_to_revenue_ratio: 0.24 },
    "6-15": { invoice_payment_days: 19, recurring_cost_ratio: 0.6, cash_reserve_days: 12, revenue_consistency: 66, outstanding_invoice_ratio: 0.09, payroll_to_revenue_ratio: 0.24 },
    "16-30": { invoice_payment_days: 18, recurring_cost_ratio: 0.59, cash_reserve_days: 13, revenue_consistency: 67, outstanding_invoice_ratio: 0.08, payroll_to_revenue_ratio: 0.23 },
    "31-50": { invoice_payment_days: 17, recurring_cost_ratio: 0.58, cash_reserve_days: 14, revenue_consistency: 68, outstanding_invoice_ratio: 0.08, payroll_to_revenue_ratio: 0.23 },
    "50+": { invoice_payment_days: 16, recurring_cost_ratio: 0.57, cash_reserve_days: 15, revenue_consistency: 69, outstanding_invoice_ratio: 0.07, payroll_to_revenue_ratio: 0.22 },
  },
};
