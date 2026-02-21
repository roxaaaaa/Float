import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Account, AIInsight, CallRecord, Incident, Invoice, Projection, Transaction } from "./types";
import { mockAccount, mockCalls, mockIncidents, mockInsights, mockInvoices, mockProjections, mockTransactions } from "./mockData";

export async function getViewerAndAccount() {
  const supabase = createServerClient();
  let user = null as any;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    return { user: null, account: mockAccount as Account, usingMock: true };
  }

  if (!user) {
    return { user: null, account: mockAccount as Account, usingMock: true };
  }

  const { data: account } = await supabase.from("accounts").select("*").eq("user_id", user.id).maybeSingle();
  return { user, account: (account ?? (mockAccount as Account)) as Account, usingMock: !account };
}

export async function getDashboardData(accountId: string) {
  const supabase = createServerClient();
  try {
    const [{ data: invoices }, { data: insights }, { data: projections }, { data: incidents }, { data: calls }, { data: transactions }] =
      await Promise.all([
        supabase.from("invoices").select("*").eq("account_id", accountId).order("due_date", { ascending: true }),
        supabase.from("ai_insights").select("*").eq("account_id", accountId).eq("dismissed", false).order("created_at", { ascending: false }),
        supabase.from("cashflow_projections").select("*").eq("account_id", accountId).order("projection_date", { ascending: true }),
        supabase.from("incidents").select("*").eq("account_id", accountId).order("opened_at", { ascending: false }),
        supabase.from("calls").select("*").eq("account_id", accountId).order("initiated_at", { ascending: false }),
        supabase.from("transactions").select("*").eq("account_id", accountId).order("created", { ascending: false }).limit(90),
      ]);

    return {
      invoices: ((invoices ?? mockInvoices) as unknown as Invoice[]) || [],
      insights: ((insights ?? mockInsights) as unknown as AIInsight[]) || [],
      projections: ((projections ?? mockProjections) as unknown as Projection[]) || [],
      incidents: ((incidents ?? mockIncidents) as unknown as Incident[]) || [],
      calls: ((calls ?? mockCalls) as unknown as CallRecord[]) || [],
      transactions: ((transactions ?? mockTransactions) as unknown as Transaction[]) || [],
    };
  } catch {
    return {
      invoices: mockInvoices as Invoice[],
      insights: mockInsights as AIInsight[],
      projections: mockProjections as Projection[],
      incidents: mockIncidents as Incident[],
      calls: mockCalls as CallRecord[],
      transactions: mockTransactions as Transaction[],
    };
  }
}
