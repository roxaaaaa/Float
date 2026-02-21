import type { IncidentEvent, IncidentSeverity, IncidentStatus } from "./types";

export function createIncidentEvent(
  type: IncidentEvent["type"],
  message: string,
  metadata?: Record<string, unknown>,
): IncidentEvent {
  return {
    type,
    message,
    timestamp: new Date().toISOString(),
    ...(metadata ? { metadata } : {}),
  };
}

export function appendIncidentEvent(events: IncidentEvent[] | null, event: IncidentEvent): IncidentEvent[] {
  return [...(events ?? []), event];
}

export function evaluateIncidentState({
  shortfallAmount,
  paymentReceived,
}: {
  shortfallAmount: number | null;
  paymentReceived: number;
}): { status: IncidentStatus; severity: IncidentSeverity; remainingShortfall: number } {
  const original = shortfallAmount ?? 0;
  const remaining = Math.max(0, original - paymentReceived);

  if (remaining === 0) {
    return { status: "resolved", severity: "P3", remainingShortfall: 0 };
  }
  if (remaining < original) {
    return { status: "monitoring", severity: "P2", remainingShortfall: remaining };
  }
  return { status: "open", severity: "P1", remainingShortfall: remaining };
}
