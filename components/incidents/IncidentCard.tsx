"use client";

import { useState } from "react";

import type { Incident } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IncidentTimeline } from "./IncidentTimeline";

export function IncidentCard({ incident }: { incident: Incident }) {
  const [expanded, setExpanded] = useState(false);
  const open = incident.status !== "resolved";
  return (
    <Card className={open ? "border-red-500/40 bg-red-500/5" : "border-emerald-500/30 bg-card/80"}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <div className="mb-2 flex gap-2">
            <Badge variant={incident.severity === "P1" ? "destructive" : incident.severity === "P2" ? "warning" : "secondary"}>
              {incident.severity}
            </Badge>
            <Badge variant={open ? "warning" : "success"}>{incident.status.toUpperCase()}</Badge>
          </div>
          <h3 className="text-lg font-semibold">{incident.title}</h3>
          <p className="text-sm text-muted-foreground">{incident.description}</p>
          {incident.shortfall_amount ? (
            <p className="mt-2 text-sm font-medium text-red-300">Shortfall: EUR {(incident.shortfall_amount / 100).toFixed(2)}</p>
          ) : null}
        </div>
        <Button variant="outline" size="sm" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Hide" : "View"} Timeline
        </Button>
      </CardHeader>
      {expanded && (
        <CardContent>
          <IncidentTimeline events={incident.events ?? []} />
        </CardContent>
      )}
    </Card>
  );
}
