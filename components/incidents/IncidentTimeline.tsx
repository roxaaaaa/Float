import type { IncidentEvent } from "@/lib/types";

export function IncidentTimeline({ events }: { events: IncidentEvent[] }) {
  return (
    <div className="space-y-2 border-l border-border pl-4">
      {events.map((event, idx) => (
        <div key={`${event.type}-${idx}`} className="relative text-sm">
          <span className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
          <p className="font-medium">{event.type}</p>
          <p className="text-muted-foreground">{event.message}</p>
          <p className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
