import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createStripePaymentLink } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAccountId } from "@/lib/api-auth";
import { appendIncidentEvent, createIncidentEvent } from "@/lib/incidents";
import type { IncidentEvent } from "@/lib/types";

const bodySchema = z.object({
  invoice_id: z.string().uuid(),
  client_name: z.string().min(1),
  invoice_number: z.string().nullable().optional(),
  amount_pence: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  const body = bodySchema.parse(await request.json());
  const accountId = await requireAccountId();
  const admin = createAdminClient();

  const paymentLink = await createStripePaymentLink({
    invoiceId: body.invoice_id,
    clientName: body.client_name,
    invoiceNumber: body.invoice_number ?? "INV",
    amountPence: body.amount_pence,
  });

  const { error } = await admin
    .from("invoices")
    .update({ stripe_payment_link: paymentLink.url, stripe_payment_intent_id: paymentLink.payment_intent_id })
    .eq("id", body.invoice_id)
    .eq("account_id", accountId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: incident } = await admin
    .from("incidents")
    .select("*")
    .eq("account_id", accountId)
    .eq("status", "open")
    .order("opened_at", { ascending: false })
    .maybeSingle();

  if (incident) {
    const events = appendIncidentEvent(
      (incident.events as IncidentEvent[]) ?? [],
      createIncidentEvent("STRIPE_LINK_CREATED", `Payment link created: ${paymentLink.url}`, {
        invoice_id: body.invoice_id,
      }),
    );
    await admin.from("incidents").update({ events }).eq("id", incident.id);
  }

  return NextResponse.json({ url: paymentLink.url });
}
