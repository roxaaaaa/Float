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
}

export async function initiateElevenLabsTwilioCall(payload: CallInitInput): Promise<CallInitResult> {
  const elevenApiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!elevenApiKey || !agentId || !twilioSid || !twilioToken || !twilioNumber) {
    return simulateCall(payload);
  }

  try {
    const response = await fetch("https://api.elevenlabs.io/v1/convai/twilio/outbound-call", {
      method: "POST",
      headers: {
        "xi-api-key": elevenApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: agentId,
        to_number: payload.to,
        from_number: twilioNumber,
        metadata: {
          client_name: payload.clientName,
          business_name: payload.businessName,
          invoice_number: payload.invoiceNumber,
          amount: payload.amount,
          payment_link: payload.paymentLink,
          notes: payload.notes ?? "",
        },
      }),
    });

    if (!response.ok) {
      return simulateCall(payload);
    }

    const data = (await response.json()) as { call_sid?: string; conversation_id?: string };
    return {
      mode: "live",
      call_sid: data.call_sid ?? `CA_LIVE_${Date.now()}`,
      elevenlabs_conversation_id: data.conversation_id ?? null,
      status: "initiated",
    };
  } catch {
    return simulateCall(payload);
  }
}

function simulateCall(payload: CallInitInput): CallInitResult {
  return {
    mode: "simulated",
    call_sid: `CA_SIM_${Date.now()}`,
    elevenlabs_conversation_id: `conv_sim_${payload.invoiceNumber}_${Date.now()}`,
    status: "in_progress",
  };
}
