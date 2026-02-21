export type RiskLevel = "critical" | "warning" | "healthy";
export type IncidentSeverity = "P1" | "P2" | "P3";
export type IncidentStatus = "open" | "resolved" | "monitoring";
export type InsightType = "critical" | "warning" | "info" | "opportunity";
export type CallStatus = "initiated" | "ringing" | "in_progress" | "completed" | "failed" | "no_answer";
export type InvoiceStatus = "unpaid" | "overdue" | "chasing" | "paid" | "disputed";

export interface Account {
  id: string;
  user_id: string;
  business_name: string;
  sector: string;
  employee_count: number;
  payroll_amount: number;
  payroll_frequency: string;
  payroll_day: string;
  monzo_connected: boolean;
  onboarding_complete: boolean;
  latest_balance_pence: number;
  risk_level: RiskLevel;
  payroll_shortfall: number | null;
  days_until_negative: number | null;
  days_until_below_payroll: number | null;
  analysis_summary: string | null;
  benchmarks: Record<string, unknown>;
  benchmark_insight: string | null;
  last_synced_at: string | null;
}

export interface Transaction {
  id: string;
  account_id: string;
  amount: number;
  merchant_name: string | null;
  category: string | null;
  description: string | null;
  is_income: boolean;
  created: string;
}

export interface Invoice {
  id: string;
  account_id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  invoice_number: string | null;
  amount: number;
  invoice_date: string | null;
  due_date: string | null;
  status: InvoiceStatus;
  stripe_payment_link: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface AIInsight {
  id: string;
  account_id: string;
  type: InsightType;
  title: string;
  message: string;
  action_label: string | null;
  action_type: string | null;
  action_data: Record<string, unknown> | null;
  dismissed: boolean;
  created_at: string;
}

export interface IncidentEvent {
  type:
    | "DETECTED"
    | "STRATEGY_COMPUTED"
    | "STRIPE_LINK_CREATED"
    | "CALL_INITIATED"
    | "CALL_IN_PROGRESS"
    | "CALL_COMPLETED"
    | "PAYMENT_RECEIVED"
    | "INCIDENT_RESOLVED"
    | "INCIDENT_UPDATED"
    | "SYSTEM_NOTE";
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Incident {
  id: string;
  account_id: string;
  severity: IncidentSeverity;
  title: string;
  description: string | null;
  status: IncidentStatus;
  shortfall_amount: number | null;
  resolution_amount: number | null;
  events: IncidentEvent[];
  opened_at: string;
  closed_at: string | null;
  resolved_by: string | null;
}

export interface CallRecord {
  id: string;
  account_id: string;
  invoice_id: string | null;
  client_name: string;
  client_phone: string;
  call_sid: string | null;
  elevenlabs_conversation_id: string | null;
  status: CallStatus;
  duration_seconds: number | null;
  outcome: string | null;
  transcript: string | null;
  initiated_at: string;
  completed_at: string | null;
}

export interface Projection {
  projection_date: string;
  projected_balance: number;
  is_below_payroll_threshold: boolean;
  is_below_zero: boolean;
  confidence_score: number;
}

export interface ClaudeAnalysisResponse {
  risk_level: RiskLevel;
  payroll_at_risk: boolean;
  payroll_shortfall: number | null;
  days_until_negative: number | null;
  days_until_below_payroll: number | null;
  summary: string;
  projected_balances: Array<{ date: string; balance: number }>;
  insights: Array<{
    type: InsightType;
    title: string;
    message: string;
    action_label: string | null;
    action_type: string | null;
    action_data?: Record<string, unknown> | null;
  }>;
}

export interface BenchmarkMetricResult {
  key: string;
  label: string;
  you: string;
  average: string;
  gap: string;
  status: "red" | "amber" | "green";
}
