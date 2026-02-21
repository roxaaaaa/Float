import crypto from "crypto";

import type { CallStatus } from "./types";

export interface CallInitInput {
  to: string;
  clientName: string;
  businessName: string;
  invoiceNumber: string;
  amount: number;
  paymentLink: string;
  notes?: string;
}

export interface CallInitResult {
  mode: "live" | "simulated";
  call_sid: string;
  elevenlabs_conversation_id: string | null;
  status: "initiated" | "in_progress";
  message: string;
}

interface ElevenLabsOutboundCallResponse {
  conversation_id?: string | null;
  conversationId?: string | null;
  call_sid?: string | null;
  callSid?: string | null;
  message?: string | null;
}

interface ElevenLabsConfig {
  apiKey: string;
  agentId: string;
  agentPhoneNumberId: string;
}

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

function getElevenLabsConfig(): ElevenLabsConfig | null {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const agentPhoneNumberId = process.env.ELEVENLABS_AGENT_PHONE_NUMBER_ID;

  if (!apiKey || !agentId || !agentPhoneNumberId) {
    return null;
  }

  return { apiKey, agentId, agentPhoneNumberId };
}

function canSimulate() {
  return process.env.ELEVENLABS_ALLOW_SIMULATION !== "false";
}

function normalizePhoneNumber(raw: string) {
  return raw.replace(/[^\d+]/g, "");
}

export async function initiateElevenLabsTwilioCall(payload: CallInitInput): Promise<CallInitResult> {
  const config = getElevenLabsConfig();

  if (!config) {
    if (canSimulate()) {
      return simulateCall(payload, "Missing ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID, or ELEVENLABS_AGENT_PHONE_NUMBER_ID.");
    }
    throw new Error("ElevenLabs is not fully configured.");
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_BASE}/convai/twilio/outbound-call`, {
      method: "POST",
      headers: {
        "xi-api-key": config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: config.agentId,
        agent_phone_number_id: config.agentPhoneNumberId,
        to_number: normalizePhoneNumber(payload.to),
        conversation_initiation_client_data: {
          dynamic_variables: {
            client_name: payload.clientName,
            business_name: payload.businessName,
            invoice_number: payload.invoiceNumber,
            amount_due: (payload.amount / 100).toFixed(2),
            amount_due_pence: String(payload.amount),
            payment_link: payload.paymentLink,
            notes: payload.notes ?? "",
          },
        },
      }),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      if (canSimulate()) {
        return simulateCall(payload, `ElevenLabs outbound call failed: ${response.status} ${responseBody}`);
      }
      throw new Error(`ElevenLabs outbound call failed: ${response.status} ${responseBody}`);
    }

    const data = (await response.json()) as ElevenLabsOutboundCallResponse;
    return {
      mode: "live",
      call_sid: data.call_sid ?? data.callSid ?? `CA_LIVE_${Date.now()}`,
      elevenlabs_conversation_id: data.conversation_id ?? data.conversationId ?? null,
      status: "initiated",
      message: data.message ?? "ElevenLabs outbound call initiated.",
    };
  } catch (error) {
    if (canSimulate()) {
      const message = error instanceof Error ? error.message : "Unknown ElevenLabs error";
      return simulateCall(payload, message);
    }
    throw error;
  }
}

function simulateCall(payload: CallInitInput, reason: string): CallInitResult {
  return {
    mode: "simulated",
    call_sid: `CA_SIM_${Date.now()}`,
    elevenlabs_conversation_id: `conv_sim_${payload.invoiceNumber}_${Date.now()}`,
    status: "in_progress",
    message: `Simulation mode: ${reason}`,
  };
}

interface VerifyWebhookSignatureInput {
  payload: string;
  signatureHeader: string | null;
  secret: string | undefined;
  toleranceSeconds?: number;
}

function parseSignatureHeader(signatureHeader: string) {
  const parts = signatureHeader
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const signatureMap = new Map<string, string>();
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key && value) {
      signatureMap.set(key, value);
    }
  }

  const timestamp = signatureMap.get("t");
  const signature = signatureMap.get("v0");
  if (!timestamp || !signature) {
    return null;
  }

  return { timestamp, signature };
}

export function verifyElevenLabsWebhookSignature({
  payload,
  signatureHeader,
  secret,
  toleranceSeconds = 30 * 60,
}: VerifyWebhookSignatureInput) {
  if (!secret) {
    return true;
  }

  if (!signatureHeader) {
    return false;
  }

  const parsed = parseSignatureHeader(signatureHeader);
  if (!parsed) {
    return false;
  }

  const timestampSeconds = Number(parsed.timestamp);
  if (!Number.isFinite(timestampSeconds)) {
    return false;
  }

  const nowSeconds = Date.now() / 1000;
  if (Math.abs(nowSeconds - timestampSeconds) > toleranceSeconds) {
    return false;
  }

  const expectedHex = crypto.createHmac("sha256", secret).update(`${parsed.timestamp}.${payload}`).digest("hex");
  const expectedBuffer = Buffer.from(expectedHex, "hex");
  const receivedBuffer = Buffer.from(parsed.signature, "hex");

  if (expectedBuffer.length === 0 || receivedBuffer.length === 0 || expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function mapElevenLabsFailureReasonToStatus(failureReason: string | null | undefined): CallStatus {
  const normalized = (failureReason ?? "").toLowerCase();

  if (
    normalized.includes("busy") ||
    normalized.includes("no-answer") ||
    normalized.includes("no_answer") ||
    normalized.includes("no answer") ||
    normalized.includes("voicemail")
  ) {
    return "no_answer";
  }

  return "failed";
}

export function formatElevenLabsTranscript(
  transcript: Array<{ role?: string | null; message?: string | null }> | null | undefined,
) {
  const lines = (transcript ?? [])
    .map((entry) => {
      const role = entry.role?.trim();
      const message = entry.message?.trim();
      if (!message) {
        return null;
      }
      return `[${role ? role.toUpperCase() : "UNKNOWN"}] ${message}`;
    })
    .filter((line): line is string => Boolean(line));

  return lines.length > 0 ? lines.join("\n") : null;
}

export function extractCallSidFromWebhookMetadata(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const root = metadata as Record<string, unknown>;
  const directCandidates = [root.call_sid, root.callSid, root.CallSid];
  for (const candidate of directCandidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  const body = root.body;
  if (!body || typeof body !== "object") {
    return null;
  }

  const bodyRecord = body as Record<string, unknown>;
  const bodyCandidates = [bodyRecord.call_sid, bodyRecord.callSid, bodyRecord.CallSid];
  for (const candidate of bodyCandidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return null;
}
