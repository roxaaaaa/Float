// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const serviceRole = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, serviceRole);

function appendEvent(events: any[], event: any) {
  return [...(events ?? []), event];
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const payload = await req.json();
  if (payload.type !== "payment_intent.succeeded") {
    return new Response(JSON.stringify({ ignored: true }), { headers: { "Content-Type": "application/json" } });
  }

  const paymentIntentId = payload.data?.object?.id as string | undefined;
  const amountReceived = payload.data?.object?.amount_received as number | undefined;
  if (!paymentIntentId) return new Response("Missing payment intent id", { status: 400 });

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (!invoice) return new Response("No invoice found", { status: 404 });

  await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      call_outcome: "payment_received",
    })
    .eq("id", invoice.id);

  const { data: incident } = await supabase
    .from("incidents")
    .select("*")
    .eq("account_id", invoice.account_id)
    .neq("status", "resolved")
    .order("opened_at", { ascending: false })
    .maybeSingle();

  if (incident) {
    const paymentEvent = {
      type: "PAYMENT_RECEIVED",
      message: `${(amountReceived ?? invoice.amount) / 100} received from ${invoice.client_name} via Stripe.`,
      timestamp: new Date().toISOString(),
      metadata: { invoice_id: invoice.id, stripe_payment_intent_id: paymentIntentId },
    };

    const nextShortfall = Math.max(0, (incident.shortfall_amount ?? 0) - (amountReceived ?? invoice.amount));
    let events = appendEvent(incident.events ?? [], paymentEvent);
    let status = incident.status;
    let severity = incident.severity;
    let closedAt: string | null = null;
    let resolvedBy: string | null = null;

    if (nextShortfall === 0) {
      events = appendEvent(events, {
        type: "INCIDENT_RESOLVED",
        message: "Payroll fully covered. Incident resolved.",
        timestamp: new Date().toISOString(),
        metadata: { resolved_by: "stripe_webhook" },
      });
      status = "resolved";
      severity = "P3";
      closedAt = new Date().toISOString();
      resolvedBy = "stripe_webhook";
    }

    await supabase
      .from("incidents")
      .update({
        events,
        shortfall_amount: nextShortfall,
        resolution_amount: (incident.resolution_amount ?? 0) + (amountReceived ?? invoice.amount),
        status,
        severity,
        closed_at: closedAt,
        resolved_by: resolvedBy,
      })
      .eq("id", incident.id);
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
});
