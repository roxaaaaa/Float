"use client";

import { useMemo } from "react";
import { Activity, CircleCheckBig, PhoneCall, ShieldCheck } from "lucide-react";

import type { Incident, IncidentEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

function eventTone(type: IncidentEvent["type"]) {
  if (type === "INCIDENT_RESOLVED" || type === "PAYMENT_RECEIVED") return "text-emerald-300 border-emerald-500/30 bg-emerald-500/10";
  if (type.includes("CALL")) return "text-primary border-primary/30 bg-primary/10";
  if (type === "DETECTED") return "text-red-300 border-red-500/30 bg-red-500/10";
  return "text-muted-foreground border-border/70 bg-card/60";
}

function Soundwave() {
  const bars = useMemo(() => Array.from({ length: 16 }, (_, i) => i), []);
  return (
    <div className="mt-4 flex h-16 items-end gap-1">
      {bars.map((bar) => (
        <span
          key={bar}
          className="w-1.5 rounded-sm bg-primary animate-wave"
          style={{
            height: `${20 + ((bar * 7) % 34)}px`,
            animationDuration: `${0.42 + (bar % 7) * 0.11}s`,
          }}
        />
      ))}
    </div>
  );
}

export function FixItModal({
  open,
  onOpenChange,
  incident,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  incident: Incident | null;
}) {
  const events = incident?.events ?? [];
  const resolved = incident?.status === "resolved";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl border-border bg-[#09101a] p-0">
        <div className="p-6 md:p-8">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl">Float is protecting your payroll</DialogTitle>
            <p className="text-sm text-muted-foreground">Every event is tracked and updated in real time.</p>
          </DialogHeader>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-xl border border-border/70 bg-card/40 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                Activity log
              </div>
              <ScrollArea className="h-[280px] pr-3">
                <div className="space-y-2 text-sm">
                  {events.map((event, idx) => (
                    <div key={`${event.type}-${idx}`} className={`rounded-md border px-3 py-2 ${eventTone(event.type)}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{event.type.replaceAll("_", " ")}</span>
                        <span className="text-xs opacity-70">{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="mt-1 text-xs opacity-90">{event.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-center gap-2 text-red-300">
                <PhoneCall className="h-4 w-4" />
                <p className="text-sm font-medium">LIVE CALL IN PROGRESS</p>
              </div>
              <p className="mt-2 text-xs text-red-200/80">AI agent is currently speaking with accounts payable.</p>
              <Soundwave />
            </div>
          </div>

          {resolved && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              <CircleCheckBig className="h-4 w-4" />
              Payroll secured. Incident closed successfully.
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Return to Dashboard</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
