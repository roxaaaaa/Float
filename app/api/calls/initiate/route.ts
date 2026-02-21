import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { initiateElevenLabsTwilioCall } from "@/lib/elevenlabs";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAccountId } from "@/lib/api-auth";
import { appendIncidentEvent, createIncidentEvent } from "@/lib/incidents";
import type { IncidentEvent } from "@/lib/types";

const bodySchema = z.object({
  invoice_id: z.string().uuid(),
  client_phone: z.string().min(6),
  client_name: z.string().min(1),
  invoice_number: z.string().nullable().optional(),
  amount: z.number(),
  business_name: z.string().min(1),
  payment_link: z.string().url(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = bodySchema.parse(await request.json());
  const accountId = await requireAccountId();
  const admin = createAdminClient();

  const callResult = await initiateElevenLabsTwilioCall({
    to: body.client_phone,
    clientName: body.client_name,
    businessName: body.business_name,
    invoiceNumber: body.invoice_number ?? "INV",
    amount: body.amount,
    paymentLink: body.payment_link,
    notes: body.notes,
  });

  const callInsert = {
    account_id: accountId,
    invoice_id: body.invoice_id,
    client_name: body.client_name,
    client_phone: body.client_phone,
    call_sid: callResult.call_sid,
    elevenlabs_conversation_id: callResult.elevenlabs_conversation_id,
    status: callResult.status,
    outcome: callResult.mode === "simulated" ? "Simulated call started" : null,
    transcript: callResult.mode === "simulated" ? "Simulation mode enabled due to missing provider configuration." : null,
    initiated_at: new Date().toISOString(),
  };

  const { data: insertedCall, error: callError } = await admin.from("calls").insert(callInsert).select("*").single();
  if (callError) {
    return NextResponse.json({ error: callError.message }, { status: 500 });
  }

  await admin.from("invoices").update({ status: "chasing", call_initiated_at: new Date().toISOString() }).eq("id", body.invoice_id);

  const { data: incident } = await admin
    .from("incidents")
    .select("*")
    .eq("account_id", accountId)
    .eq("status", "open")
    .order("opened_at", { ascending: false })
    .maybeSingle();

  const linkEvent = createIncidentEvent("STRIPE_LINK_CREATED", `Payment link created: ${body.payment_link}`, {
    invoice_number: body.invoice_number ?? null,
    payment_link: body.payment_link,
  });
  const callEvent = createIncidentEvent("CALL_INITIATED", `AI call initiated to ${body.client_name} (${body.client_phone})`, {
    call_sid: callResult.call_sid,
    simulated: callResult.mode === "simulated",
  });

  if (incident) {
    const events = appendIncidentEvent(
      appendIncidentEvent((incident.events as IncidentEvent[]) ?? [], linkEvent),
      callEvent,
    );
    await admin.from("incidents").update({ events, status: "open", severity: "P1" }).eq("id", incident.id);
  } else {
    await admin.from("incidents").insert({
      account_id: accountId,
      severity: "P1",
      title: "Invoice Collection Incident",
      description: `Chasing ${body.invoice_number ?? "invoice"} to secure payroll.`,
      status: "open",
      shortfall_amount: null,
      events: [linkEvent, callEvent] as IncidentEvent[],
    });
  }

  return NextResponse.json({
    ok: true,
    mode: callResult.mode,
    call: insertedCall,
  });
}
