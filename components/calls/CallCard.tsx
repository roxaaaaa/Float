import { Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CallRecord } from "@/lib/types";

export function CallCard({ call }: { call: CallRecord }) {
  const isLive = call.status === "in_progress" || call.status === "ringing";
  const isFailed = call.status === "failed" || call.status === "no_answer";

  return (
    <Card className={isLive ? "border-red-500/50 bg-red-500/5" : isFailed ? "border-red-400/30" : "border-emerald-400/30 bg-card/80"}>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{call.client_name}</h3>
          <Badge variant={isLive ? "destructive" : isFailed ? "warning" : "success"}>
            {isLive ? "LIVE" : call.status.replace("_", " ")}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{call.client_phone}</p>
        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" />
          {call.duration_seconds ?? 0}s
        </p>
        <p className="text-sm text-muted-foreground">{call.outcome ?? "Call in progress..."}</p>
        <div>
          <Button variant={isFailed ? "destructive" : "outline"} size="sm">
            {isFailed ? "Retry Call" : "View Transcript"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
