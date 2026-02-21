"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { CallCard } from "@/components/calls/CallCard";
import { InitiateCallModal } from "@/components/calls/InitiateCallModal";
import { LiveCallPanel } from "@/components/calls/LiveCallPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCalls, mockInvoices } from "@/lib/mockData";
import type { CallRecord } from "@/lib/types";

export default function CallsPage() {
  const [calls, setCalls] = useState<CallRecord[]>(mockCalls);

  const totals = useMemo(() => {
    const completed = calls.filter((c) => c.status === "completed");
    return {
      count: calls.length,
      collected: 840000,
      avgDuration:
        completed.length === 0
          ? "0:00"
          : `${Math.floor((completed.reduce((s, c) => s + (c.duration_seconds ?? 0), 0) / completed.length) / 60)}:${String(Math.round((completed.reduce((s, c) => s + (c.duration_seconds ?? 0), 0) / completed.length) % 60)).padStart(2, "0")}`,
    };
  }, [calls]);

  const liveCall = calls.find((c) => c.status === "in_progress" || c.status === "ringing") ?? null;

  async function initiateCall(payload: { invoiceId: string; clientName: string; clientPhone: string; notes: string }) {
    const invoice = mockInvoices.find((i) => i.id === payload.invoiceId);
    if (!invoice) return;
    const response = await fetch("/api/calls/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoice_id: invoice.id,
        client_phone: payload.clientPhone,
        client_name: payload.clientName,
        invoice_number: invoice.invoice_number,
        amount: invoice.amount,
        business_name: "The Cobblestone Kitchen",
        payment_link: invoice.stripe_payment_link ?? "https://pay.stripe.com/mock",
        notes: payload.notes,
      }),
    });
    const data = await response.json();
    setCalls((prev) => [data.call, ...prev]);
  }

  return (
    <AppShell title="AI Calls" businessName="The Cobblestone Kitchen" monzoConnected>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">AI Calls</h2>
          <InitiateCallModal invoices={mockInvoices} onInitiate={initiateCall} />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total calls made</p>
              <p className="text-2xl font-semibold">{totals.count}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total collected</p>
              <p className="text-2xl font-semibold">EUR {(totals.collected / 100).toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Average call duration</p>
              <p className="text-2xl font-semibold">{totals.avgDuration}</p>
            </CardContent>
          </Card>
        </div>

        <LiveCallPanel call={liveCall} />

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {calls.map((call) => (
              <CallCard key={call.id} call={call} />
            ))}
          </TabsContent>
          <TabsContent value="active" className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {calls
              .filter((c) => c.status === "in_progress" || c.status === "ringing")
              .map((call) => (
                <CallCard key={call.id} call={call} />
              ))}
          </TabsContent>
          <TabsContent value="completed" className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {calls
              .filter((c) => c.status === "completed")
              .map((call) => (
                <CallCard key={call.id} call={call} />
              ))}
          </TabsContent>
          <TabsContent value="failed" className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {calls
              .filter((c) => c.status === "failed" || c.status === "no_answer")
              .map((call) => (
                <CallCard key={call.id} call={call} />
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
