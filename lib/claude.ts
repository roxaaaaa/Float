import Anthropic from "@anthropic-ai/sdk";
import type { ClaudeAnalysisResponse, Projection, Transaction, Invoice, AIInsight, Incident } from "./types";
import { projectCashflow, summarizeRisk } from "./cashflow";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

const ANALYSIS_SYSTEM_PROMPT = `You are Float, an AI CFO for small businesses. Analyse the provided
Monzo transaction data and return ONLY valid JSON with these exact fields:
{
  "risk_level": "critical|warning|healthy",
  "payroll_at_risk": boolean,
  "payroll_shortfall": number_in_pence_or_null,
  "days_until_negative": number_or_null,
  "days_until_below_payroll": number_or_null,
  "summary": "one sentence CFO summary",
  "projected_balances": [{"date": "YYYY-MM-DD", "balance": number_in_pence}],
  "insights": [{"type": "critical|warning|info|opportunity", "title": string, "message": string, "action_label": string_or_null, "action_type": string_or_null}]
}`;

export async function analyzeWithClaudeOrFallback({
  transactions,
  invoices,
  payrollAmount,
  payrollDay,
  currentBalance,
}: {
  transactions: Transaction[];
  invoices: Invoice[];
  payrollAmount: number;
  payrollDay: string;
  currentBalance: number;
}): Promise<ClaudeAnalysisResponse> {
  const client = getClient();
  if (!client) {
    return fallbackAnalysis({ transactions, invoices, payrollAmount, payrollDay, currentBalance });
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1400,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: JSON.stringify({ transactions, invoices, payrollAmount, payrollDay, currentBalance }),
        },
      ],
    });

    const text = message.content
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("");
    const parsed = JSON.parse(text) as ClaudeAnalysisResponse;
    return parsed;
  } catch {
    return fallbackAnalysis({ transactions, invoices, payrollAmount, payrollDay, currentBalance });
  }
}

function fallbackAnalysis({
  transactions,
  invoices,
  payrollAmount,
  payrollDay,
  currentBalance,
}: {
  transactions: Transaction[];
  invoices: Invoice[];
  payrollAmount: number;
  payrollDay: string;
  currentBalance: number;
}): ClaudeAnalysisResponse {
  const projections = projectCashflow({
    currentBalancePence: currentBalance,
    payrollAmountPence: payrollAmount,
    payrollDay,
    transactions,
    invoices,
  });
  const risk = summarizeRisk(projections, payrollAmount);
  const bestInvoice = invoices.filter((i) => i.status !== "paid").sort((a, b) => b.amount - a.amount)[0];
  return {
    risk_level: risk.risk_level,
    payroll_at_risk: risk.payroll_at_risk,
    payroll_shortfall: risk.payroll_shortfall,
    days_until_negative: risk.days_until_negative,
    days_until_below_payroll: risk.days_until_below_payroll,
    summary: risk.payroll_at_risk
      ? `Payroll is at risk with an estimated shortfall of ${risk.payroll_shortfall ?? 0} pence.`
      : "Cashflow is stable for the next 30 days.",
    projected_balances: projections.map((p) => ({ date: p.projection_date, balance: p.projected_balance })),
    insights: [
      {
        type: risk.payroll_at_risk ? "critical" : "info",
        title: risk.payroll_at_risk ? "Payroll at risk" : "Cashflow stable",
        message: risk.payroll_at_risk
          ? `Current trajectory shows payroll shortfall of ${(risk.payroll_shortfall ?? 0) / 100}.`
          : "No immediate payroll risk detected in fallback analysis.",
        action_label: bestInvoice ? `Chase ${bestInvoice.invoice_number ?? "invoice"}` : null,
        action_type: bestInvoice ? "chase_invoice" : null,
        action_data: bestInvoice ? { invoice_id: bestInvoice.id } : null,
      },
    ],
  };
}

export async function streamClaudeChatOrFallback({
  message,
  context,
  onToken,
}: {
  message: string;
  context: {
    balance: number;
    transactions: Transaction[];
    invoices: Invoice[];
    projections: Projection[];
    insights: AIInsight[];
    incidents: Incident[];
  };
  onToken: (token: string) => Promise<void> | void;
}) {
  const client = getClient();

  if (!client) {
    const fallback =
      `Based on your latest balance of ${(context.balance / 100).toFixed(2)} and open invoices, ` +
      `the top priority is collecting overdue receivables before payroll. ` +
      `You currently have ${context.invoices.filter((i) => i.status !== "paid").length} open invoices.`;
    for (const token of fallback.split(" ")) {
      // intentionally small token-sized chunks for SSE UX
      await onToken(`${token} `);
      await new Promise((r) => setTimeout(r, 15));
    }
    return;
  }

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 1200,
    system: "You are Float AI CFO. Reply with direct, quantitative, actionable financial answers.",
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          message,
          context,
        }),
      },
    ],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      await onToken(event.delta.text);
    }
  }
}
