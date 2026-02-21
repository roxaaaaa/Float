import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { appendIncidentEvent, createIncidentEvent } from "@/lib/incidents";
import {
  extractCallSidFromWebhookMetadata,
  formatElevenLabsTranscript,
  mapElevenLabsFailureReasonToStatus,
  verifyElevenLabsWebhookSignature,
} from "@/lib/elevenlabs";
import { createAdminClient } from "@/lib/supabase/admin";
import type { IncidentEvent } from "@/lib/types";

export const runtime = "nodejs";

const transcriptTurnSchema = z.object({
  role: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
});

const postCallTranscriptionSchema = z.object({
  type: z.literal("post_call_transcription"),
  event_timestamp: z.number().optional(),
  data: z.object({
    conversation_id: z.string().min(1),
    transcript: z.array(transcriptTurnSchema).optional(),
    analysis: z
      .object({
        call_successful: z.boolean().nullable().optional(),
        transcript_summary: z.string().nullable().optional(),
      })
      .optional(),
    metadata: z.unknown().optional(),
  }),
});

const callInitiationFailureSchema = z.object({
  type: z.literal("call_initiation_failure"),
  event_timestamp: z.number().optional(),
  data: z.object({
    conversation_id: z.string().nullable().optional(),
    failure_reason: z.string().nullable().optional(),
    metadata: z.unknown().optional(),
  }),
});

const postCallAudioSchema = z.object({
  type: z.literal("post_call_audio"),
  event_timestamp: z.number().optional(),
  data: z.object({
    conversation_id: z.string().nullable().optional(),
    metadata: z.unknown().optional(),
  }),
});

const webhookSchema = z.discriminatedUnion("type", [
  postCallTranscriptionSchema,
  callInitiationFailureSchema,
  postCallAudioSchema,
]);

interface PersistedCallRow {
  id: string;
  account_id: string;
  invoice_id: string | null;
  client_name: string;
  call_sid: string | null;
  elevenlabs_conversation_id: string | null;
  status: string;
  outcome: string | null;
  transcript: string | null;
}

function getDurationSecondsFromMetadata(metadata: unknown): number | null {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const root = metadata as Record<string, unknown>;
  const direct = root.call_duration_secs;
  if (typeof direct === "number" && Number.isFinite(direct)) {
    return Math.round(direct);
  }
  if (typeof direct === "string" && direct.trim() && Number.isFinite(Number(direct))) {
    return Math.round(Number(direct));
  }

  const body = root.body;
  if (!body || typeof body !== "object") {
    return null;
  }

  const bodyRecord = body as Record<string, unknown>;
  const callDuration = bodyRecord.CallDuration;
  if (typeof callDuration === "number" && Number.isFinite(callDuration)) {
    return Math.round(callDuration);
  }
  if (typeof callDuration === "string" && callDuration.trim() && Number.isFinite(Number(callDuration))) {
    return Math.round(Number(callDuration));
  }

  return null;
}

async function getLatestCallByConversationId(admin: ReturnType<typeof createAdminClient>, conversationId: string) {
  const { data, error } = await admin
    .from("calls")
    .select("*")
    .eq("elevenlabs_conversation_id", conversationId)
    .order("initiated_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return ((data ?? [])[0] as PersistedCallRow | undefined) ?? null;
}

async function getLatestCallBySid(admin: ReturnType<typeof createAdminClient>, callSid: string) {
  const { data, error } = await admin.from("calls").select("*").eq("call_sid", callSid).order("initiated_at", { ascending: false }).limit(1);

  if (error) throw error;
  return ((data ?? [])[0] as PersistedCallRow | undefined) ?? null;
}

async function findCallForWebhook({
  admin,
  conversationId,
  callSid,
}: {
  admin: ReturnType<typeof createAdminClient>;
  conversationId: string | null | undefined;
  callSid: string | null;
}) {
  if (conversationId) {
    const byConversation = await getLatestCallByConversationId(admin, conversationId);
    if (byConversation) return byConversation;
  }

  if (callSid) {
    const bySid = await getLatestCallBySid(admin, callSid);
    if (bySid) return bySid;
  }

  return null;
}

async function appendCallIncidentEvent({
  admin,
  accountId,
  event,
}: {
  admin: ReturnType<typeof createAdminClient>;
  accountId: string;
  event: IncidentEvent;
}) {
  const { data: incidents, error: incidentError } = await admin
    .from("incidents")
    .select("id, events")
    .eq("account_id", accountId)
    .in("status", ["open", "monitoring"])
    .order("opened_at", { ascending: false })
    .limit(1);

  if (incidentError) {
    throw incidentError;
  }

  const latestIncident = incidents?.[0];
  if (!latestIncident) {
    await admin.from("incidents").insert({
      account_id: accountId,
      severity: "P2",
      title: "Call update",
      description: "ElevenLabs webhook event",
      status: "open",
      events: [event] as IncidentEvent[],
    });
    return;
  }

  const events = appendIncidentEvent((latestIncident.events as IncidentEvent[]) ?? [], event);
  await admin.from("incidents").update({ events }).eq("id", latestIncident.id);
}

async function handlePostCallTranscription({
  admin,
  payload,
}: {
  admin: ReturnType<typeof createAdminClient>;
  payload: z.infer<typeof postCallTranscriptionSchema>;
}) {
  const conversationId = payload.data.conversation_id;
  const call = await findCallForWebhook({ admin, conversationId, callSid: null });

  if (!call) {
    return NextResponse.json({ ok: true, ignored: "No call found for conversation_id." });
  }

  const now = new Date().toISOString();
  const transcriptText = formatElevenLabsTranscript(payload.data.transcript ?? []);
  const durationSeconds = getDurationSecondsFromMetadata(payload.data.metadata);
  const callSuccessful = payload.data.analysis?.call_successful;
  const summary = payload.data.analysis?.transcript_summary?.trim() || null;

  const outcomePrefix =
    callSuccessful === true
      ? "Call completed successfully"
      : callSuccessful === false
        ? "Call completed without commitment"
        : "Call completed";
  const outcome = summary ? `${outcomePrefix}: ${summary}` : outcomePrefix;

  const callUpdate: Record<string, unknown> = {
    status: "completed",
    completed_at: now,
    outcome,
  };
  if (durationSeconds !== null) {
    callUpdate.duration_seconds = durationSeconds;
  }
  if (transcriptText) {
    callUpdate.transcript = transcriptText;
  }

  await admin.from("calls").update(callUpdate).eq("id", call.id);

  if (call.invoice_id) {
    await admin
      .from("invoices")
      .update({
        call_completed_at: now,
        call_outcome: outcome,
        call_notes: summary ?? transcriptText ?? null,
        call_sid: call.call_sid,
      })
      .eq("id", call.invoice_id);
  }

  await appendCallIncidentEvent({
    admin,
    accountId: call.account_id,
    event: createIncidentEvent("CALL_COMPLETED", `Call completed with ${call.client_name}.`, {
      call_id: call.id,
      call_sid: call.call_sid,
      conversation_id: conversationId,
      call_successful: callSuccessful ?? null,
      duration_seconds: durationSeconds,
    }),
  });

  return NextResponse.json({ ok: true, status: "updated", type: payload.type });
}

async function handleCallInitiationFailure({
  admin,
  payload,
}: {
  admin: ReturnType<typeof createAdminClient>;
  payload: z.infer<typeof callInitiationFailureSchema>;
}) {
  const conversationId = payload.data.conversation_id;
  const callSid = extractCallSidFromWebhookMetadata(payload.data.metadata);
  const call = await findCallForWebhook({ admin, conversationId, callSid });

  if (!call) {
    return NextResponse.json({ ok: true, ignored: "No call found for call initiation failure." });
  }

  const now = new Date().toISOString();
  const failureReason = (payload.data.failure_reason ?? "unknown").trim();
  const status = mapElevenLabsFailureReasonToStatus(failureReason);
  const outcome = `Call failed to initiate (${failureReason}).`;
  const durationSeconds = getDurationSecondsFromMetadata(payload.data.metadata);

  const callUpdate: Record<string, unknown> = {
    status,
    completed_at: now,
    outcome,
  };
  if (durationSeconds !== null) {
    callUpdate.duration_seconds = durationSeconds;
  }

  await admin.from("calls").update(callUpdate).eq("id", call.id);

  if (call.invoice_id) {
    await admin
      .from("invoices")
      .update({
        call_completed_at: now,
        call_outcome: outcome,
        call_notes: failureReason,
        call_sid: call.call_sid ?? callSid,
      })
      .eq("id", call.invoice_id);
  }

  await appendCallIncidentEvent({
    admin,
    accountId: call.account_id,
    event: createIncidentEvent("CALL_COMPLETED", `Call failed for ${call.client_name}: ${failureReason}`, {
      call_id: call.id,
      call_sid: call.call_sid ?? callSid,
      conversation_id: conversationId ?? null,
      failure_reason: failureReason,
      resolved_status: status,
    }),
  });

  return NextResponse.json({ ok: true, status: "updated", type: payload.type });
}

async function handlePostCallAudio({
  admin,
  payload,
}: {
  admin: ReturnType<typeof createAdminClient>;
  payload: z.infer<typeof postCallAudioSchema>;
}) {
  const conversationId = payload.data.conversation_id;
  if (!conversationId) {
    return NextResponse.json({ ok: true, ignored: "No conversation_id provided for audio payload." });
  }

  const call = await findCallForWebhook({ admin, conversationId, callSid: null });
  if (!call) {
    return NextResponse.json({ ok: true, ignored: "No call found for audio payload." });
  }

  await appendCallIncidentEvent({
    admin,
    accountId: call.account_id,
    event: createIncidentEvent("SYSTEM_NOTE", "Received ElevenLabs post-call audio payload.", {
      call_id: call.id,
      conversation_id: conversationId,
    }),
  });

  return NextResponse.json({ ok: true, status: "logged", type: payload.type });
}

export async function POST(request: NextRequest) {
  const rawPayload = await request.text();
  const signatureHeader = request.headers.get("elevenlabs-signature");

  const isValidSignature = verifyElevenLabsWebhookSignature({
    payload: rawPayload,
    signatureHeader,
    secret: process.env.ELEVENLABS_WEBHOOK_SECRET,
  });

  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid ElevenLabs webhook signature." }, { status: 401 });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawPayload);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = webhookSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createAdminClient();
  const payload = parsed.data;

  if (payload.type === "post_call_transcription") {
    return handlePostCallTranscription({ admin, payload });
  }
  if (payload.type === "call_initiation_failure") {
    return handleCallInitiationFailure({ admin, payload });
  }
  return handlePostCallAudio({ admin, payload });
}
