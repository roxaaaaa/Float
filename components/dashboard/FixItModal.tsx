"use client";

import { useMemo } from "react";
import { PhoneCall } from "lucide-react";

import type { Incident, IncidentEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

function eventIcon(type: IncidentEvent["type"]) {
  if (type.includes("CALL")) return "📞";
  if (type.includes("PAYMENT") || type === "INCIDENT_RESOLVED") return "✅";
  return "•";
}

function Soundwave() {
  const bars = useMemo(() => Array.from({ length: 14 }, (_, i) => i), []);
  return (
    <div className="mt-4 flex h-14 items-end gap-1">
      {bars.map((bar) => (
        <span
          key={bar}
          className="w-1 rounded-sm bg-primary animate-wave"
          style={{
            height: `${20 + ((bar * 7) % 30)}px`,
            animationDuration: `${0.4 + (bar % 6) * 0.12}s`,
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl border-border bg-[#0b1018] p-0">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Float is protecting your payroll</DialogTitle>
          </DialogHeader>

          <div className="mt-6 rounded-lg border border-border bg-card/40 p-4">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">Activity Log</h3>
            <ScrollArea className="h-[260px] pr-3">
              <div className="space-y-2 text-sm">
                {(incident?.events ?? []).map((event, idx) => (
                  <div key={`${event.type}-${idx}`} className="rounded-md border border-border/60 bg-background/30 px-3 py-2">
                    <span className="mr-2">{eventIcon(event.type)}</span>
                    <span>{event.message}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-center gap-2 text-red-300">
              <PhoneCall className="h-4 w-4" />
              <p className="text-sm font-medium">LIVE CALL IN PROGRESS</p>
            </div>
            <Soundwave />
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Return to Dashboard</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
