import { NextResponse } from "next/server";

import { analyzeWithClaudeOrFallback } from "@/lib/claude";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAccountId } from "@/lib/api-auth";
import { appendIncidentEvent, createIncidentEvent } from "@/lib/incidents";
import { calculateBenchmarks } from "@/lib/benchmarks";
import type { IncidentEvent } from "@/lib/types";

export async function POST() {
  const accountId = await requireAccountId();
  const admin = createAdminClient();

  const [{ data: account }, { data: transactions }, { data: invoices }] = await Promise.all([
    admin.from("accounts").select("*").eq("id", accountId).single(),
    admin.from("transactions").select("*").eq("account_id", accountId).order("created", { ascending: false }).limit(90),
    admin.from("invoices").select("*").eq("account_id", accountId).order("due_date", { ascending: true }),
  ]);

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const analysis = await analyzeWithClaudeOrFallback({
    transactions: (transactions ?? []) as any,
    invoices: (invoices ?? []) as any,
    payrollAmount: account.payroll_amount ?? 0,
    payrollDay: account.payroll_day ?? "friday",
    currentBalance: account.latest_balance_pence ?? 0,
  });

  const benchmark = calculateBenchmarks({
    sector: (account.sector as "restaurant") ?? "restaurant",
    employeeCount: account.employee_count ?? 8,
    payrollAmount: account.payroll_amount ?? 0,
    currentBalance: account.latest_balance_pence ?? 0,
    transactions: (transactions ?? []) as any,
    invoices: (invoices ?? []) as any,
  });

  await Promise.all([
    admin.from("cashflow_projections").delete().eq("account_id", accountId),
    admin.from("ai_insights").delete().eq("account_id", accountId),
  ]);

  const projectionRows = analysis.projected_balances.map((p) => ({
    account_id: accountId,
    projection_date: p.date,
    projected_balance: p.balance,
    is_below_payroll_threshold: p.balance < (account.payroll_amount ?? 0),
    is_below_zero: p.balance < 0,
    confidence_score: 0.84,
  }));

  const insightRows = analysis.insights.map((i) => ({
    account_id: accountId,
    type: i.type,
    title: i.title,
    message: i.message,
    action_label: i.action_label,
    action_type: i.action_type,
    action_data: i.action_data ?? null,
    dismissed: false,
  }));

  await Promise.all([
    projectionRows.length > 0 ? admin.from("cashflow_projections").insert(projectionRows) : Promise.resolve(),
    insightRows.length > 0 ? admin.from("ai_insights").insert(insightRows) : Promise.resolve(),
    admin
      .from("accounts")
      .update({
        risk_level: analysis.risk_level,
        payroll_shortfall: analysis.payroll_shortfall,
        days_until_negative: analysis.days_until_negative,
        days_until_below_payroll: analysis.days_until_below_payroll,
        analysis_summary: analysis.summary,
        benchmarks: benchmark.results,
        benchmark_insight: benchmark.insight,
      })
      .eq("id", accountId),
  ]);

  if (analysis.payroll_at_risk && analysis.payroll_shortfall) {
    const { data: incident } = await admin
      .from("incidents")
      .select("*")
      .eq("account_id", accountId)
      .eq("status", "open")
      .order("opened_at", { ascending: false })
      .maybeSingle();

    const detectEvent = createIncidentEvent(
      "DETECTED",
      `Payroll shortfall of EUR ${(analysis.payroll_shortfall / 100).toFixed(2)} identified.`,
      { shortfall: analysis.payroll_shortfall },
    );
    const strategyEvent = createIncidentEvent("STRATEGY_COMPUTED", "Claude identified overdue invoices as immediate recovery path.");

    if (!incident) {
      await admin.from("incidents").insert({
        account_id: accountId,
        severity: analysis.risk_level === "critical" ? "P1" : "P2",
        status: "open",
        title: `Payroll Crisis - EUR ${(analysis.payroll_shortfall / 100).toFixed(2)} Shortfall`,
        description: analysis.summary,
        shortfall_amount: analysis.payroll_shortfall,
        events: [detectEvent, strategyEvent] as IncidentEvent[],
      });
    } else {
      const events = appendIncidentEvent(
        appendIncidentEvent((incident.events as IncidentEvent[]) ?? [], detectEvent),
        strategyEvent,
      );
      await admin.from("incidents").update({ events, severity: analysis.risk_level === "critical" ? "P1" : "P2" }).eq("id", incident.id);
    }
  }

  return NextResponse.json({ ok: true, analysis });
}
