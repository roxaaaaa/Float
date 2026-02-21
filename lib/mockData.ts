import type { Account, AIInsight, Incident, Invoice, Projection, Transaction, CallRecord } from "./types";

export const mockAccount: Partial<Account> = {
  id: "00000000-0000-0000-0000-000000000001",
  business_name: "The Cobblestone Kitchen",
  sector: "restaurant",
  employee_count: 8,
  payroll_amount: 840000,
  payroll_frequency: "biweekly",
  payroll_day: "friday",
  monzo_connected: true,
  onboarding_complete: true,
  latest_balance_pence: 620000,
  risk_level: "critical",
  payroll_shortfall: 220000,
  analysis_summary: "Payroll risk detected before Friday unless overdue invoice is collected.",
};

export const mockTransactions: Transaction[] = [
  { id: "tx_1", account_id: mockAccount.id!, amount: -90000, merchant_name: "Flour Supplier", category: "supplies", description: "Supplier invoice", is_income: false, created: new Date().toISOString() },
  { id: "tx_2", account_id: mockAccount.id!, amount: -220000, merchant_name: "Rent", category: "rent", description: "Monthly rent", is_income: false, created: new Date().toISOString() },
  { id: "tx_3", account_id: mockAccount.id!, amount: 280000, merchant_name: "Card Settlements", category: "income", description: "Revenue settlement", is_income: true, created: new Date().toISOString() },
];

export const mockInvoices: Invoice[] = [
  {
    id: "11111111-1111-1111-1111-111111111001",
    account_id: mockAccount.id!,
    client_name: "TechCorp Dublin",
    client_phone: "+35312345678",
    client_email: "ap@techcorp.ie",
    invoice_number: "INV-047",
    amount: 240000,
    invoice_date: "2026-01-28",
    due_date: "2026-02-07",
    status: "overdue",
    stripe_payment_link: null,
    stripe_payment_intent_id: null,
    paid_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111002",
    account_id: mockAccount.id!,
    client_name: "Northside Catering",
    client_phone: "+35312888999",
    client_email: "finance@northside.ie",
    invoice_number: "INV-051",
    amount: 180000,
    invoice_date: "2026-02-04",
    due_date: "2026-02-15",
    status: "unpaid",
    stripe_payment_link: null,
    stripe_payment_intent_id: null,
    paid_at: null,
    created_at: new Date().toISOString(),
  },
];

export const mockInsights: AIInsight[] = [
  {
    id: "i1",
    account_id: mockAccount.id!,
    type: "critical",
    title: "Payroll at risk",
    message: "EUR 2,200 shortfall before Friday payroll. TechCorp Dublin owes EUR 2,400.",
    action_label: "Chase INV-047",
    action_type: "chase_invoice",
    action_data: { invoice_id: mockInvoices[0].id },
    dismissed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "i2",
    account_id: mockAccount.id!,
    type: "info",
    title: "Client payment behavior",
    message: "TechCorp Dublin has been late on 3 of their last 4 invoices.",
    action_label: null,
    action_type: null,
    action_data: null,
    dismissed: false,
    created_at: new Date().toISOString(),
  },
];

export const mockProjections: Projection[] = Array.from({ length: 30 }).map((_, i) => ({
  projection_date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
  projected_balance: 620000 - i * 23000 + (i === 3 ? 80000 : 0),
  is_below_payroll_threshold: i > 8,
  is_below_zero: i > 17,
  confidence_score: 0.84,
}));

export const mockIncidents: Incident[] = [
  {
    id: "inc_001",
    account_id: mockAccount.id!,
    severity: "P1",
    title: "Payroll Crisis - EUR 2,200 Shortfall",
    description: "Next payroll run at risk unless overdue invoice is collected.",
    status: "open",
    shortfall_amount: 220000,
    resolution_amount: null,
    events: [
      { type: "DETECTED", message: "Payroll shortfall of EUR 2,200 identified.", timestamp: new Date().toISOString() },
      { type: "STRATEGY_COMPUTED", message: "INV-047 selected as best recovery path.", timestamp: new Date().toISOString() },
    ],
    opened_at: new Date().toISOString(),
    closed_at: null,
    resolved_by: null,
  },
];

export const mockCalls: CallRecord[] = [
  {
    id: "call_001",
    account_id: mockAccount.id!,
    invoice_id: mockInvoices[0].id,
    client_name: "TechCorp Dublin",
    client_phone: "+35312345678",
    call_sid: null,
    elevenlabs_conversation_id: null,
    status: "in_progress",
    duration_seconds: 47,
    outcome: null,
    transcript: null,
    initiated_at: new Date().toISOString(),
    completed_at: null,
  },
];
