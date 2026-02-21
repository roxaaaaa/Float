"use client";

import { useMemo } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockIncidents } from "@/lib/mockData";

export default function IncidentsPage() {
  const incidents = mockIncidents;
  const stats = useMemo(() => {
    const resolved = incidents.filter((i) => i.status === "resolved");
    return {
      total: incidents.length,
      resolvedPct: incidents.length ? Math.round((resolved.length / incidents.length) * 100) : 0,
      recovered: incidents.reduce((sum, i) => sum + (i.resolution_amount ?? 0), 0),
    };
  }, [incidents]);

  return (
    <AppShell title="Financial Incidents" businessName="The Cobblestone Kitchen" monzoConnected>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Financial Incidents</h2>
            <p className="text-sm text-muted-foreground">Live risk timeline with event-by-event resolution tracking.</p>
          </div>
          <Badge variant="warning">{incidents.filter((i) => i.status !== "resolved").length} Open</Badge>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card className="border-border/70 bg-card/80">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total incidents</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/80">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Resolved within 1 hour</p>
              <p className="text-2xl font-semibold">{stats.resolvedPct}%</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/80">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total money recovered</p>
              <p className="text-2xl font-semibold">EUR {(stats.recovered / 100).toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4 space-y-4">
            {incidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </TabsContent>
          <TabsContent value="open" className="mt-4 space-y-4">
            {incidents.filter((i) => i.status !== "resolved").map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </TabsContent>
          <TabsContent value="resolved" className="mt-4 space-y-4">
            {incidents.filter((i) => i.status === "resolved").map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
