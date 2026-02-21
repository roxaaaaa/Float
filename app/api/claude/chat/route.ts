import { NextRequest } from "next/server";
import { z } from "zod";

import { streamClaudeChatOrFallback } from "@/lib/claude";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAccountId } from "@/lib/api-auth";
import type { AIInsight, Incident, Invoice, Projection, Transaction } from "@/lib/types";

const requestSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional(),
});

export async function POST(request: NextRequest) {
  const body = requestSchema.parse(await request.json());
  const accountId = await requireAccountId();
  const admin = createAdminClient();

  const [{ data: account }, { data: transactions }, { data: invoices }, { data: projections }, { data: insights }, { data: incidents }] =
    await Promise.all([
      admin.from("accounts").select("latest_balance_pence").eq("id", accountId).single(),
      admin.from("transactions").select("*").eq("account_id", accountId).order("created", { ascending: false }).limit(30),
      admin.from("invoices").select("*").eq("account_id", accountId).neq("status", "paid"),
      admin.from("cashflow_projections").select("*").eq("account_id", accountId).order("projection_date", { ascending: true }).limit(30),
      admin.from("ai_insights").select("*").eq("account_id", accountId).eq("dismissed", false).order("created_at", { ascending: false }).limit(8),
      admin.from("incidents").select("*").eq("account_id", accountId).order("opened_at", { ascending: false }).limit(3),
    ]);

  await admin.from("chat_messages").insert({
    account_id: accountId,
    role: "user",
    content: body.message,
  });

  let assistantResponse = "";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      await streamClaudeChatOrFallback({
        message: body.message,
        context: {
          balance: account?.latest_balance_pence ?? 0,
          transactions: (transactions ?? []) as Transaction[],
          invoices: (invoices ?? []) as Invoice[],
          projections: (projections ?? []) as Projection[],
          insights: (insights ?? []) as AIInsight[],
          incidents: (incidents ?? []) as Incident[],
        },
        onToken: async (token) => {
          assistantResponse += token;
          controller.enqueue(encoder.encode(`data: ${token}\n\n`));
        },
      });

      await admin.from("chat_messages").insert({
        account_id: accountId,
        role: "assistant",
        content: assistantResponse.trim(),
      });

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
