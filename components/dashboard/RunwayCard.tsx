import { Card, CardContent } from "@/components/ui/card";
import { Gauge } from "lucide-react";

export function RunwayCard({ days }: { days: number }) {
  const isCritical = days < 14;
  const progress = Math.max(0, Math.min(100, (days / 45) * 100));
  return (
    <Card className="border-border/70 bg-card/80">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Runway</p>
          <Gauge className="h-4 w-4 text-primary" />
        </div>
        <p className={`mt-3 text-3xl font-semibold ${isCritical ? "text-red-400" : ""}`}>{days} days</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
          <div className={`h-full ${isCritical ? "bg-red-500" : days < 24 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Based on Claude&apos;s 30-day analysis</p>
      </CardContent>
    </Card>
  );
}
