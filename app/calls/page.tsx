"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { CallCard } from "@/components/calls/CallCard";
import { InitiateCallModal } from "@/components/calls/InitiateCallModal";
import { LiveCallPanel } from "@/components/calls/LiveCallPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCalls, mockInvoices } from "@/lib/mockData";
import type { CallRecord, Invoice } from "@/lib/types";

export default function CallsPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const loadedRef = useRef(false);

  const refreshData = useCallback(async () => {
    try {
      const [callsResponse, invoicesResponse] = await Promise.all([
        fetch("/api/calls", { cache: "no-store" }),
        fetch("/api/invoices", { cache: "no-store" }),
      ]);

      const [callsData, invoicesData] = await Promise.all([callsResponse.json(), invoicesResponse.json()]);

      if (callsResponse.ok && Array.isArray(callsData.calls)) {
        setCalls(callsData.calls as CallRecord[]);
      } else if (!loadedRef.current) {
        setCalls(mockCalls);
      }

      if (invoicesResponse.ok && Array.isArray(invoicesData.invoices)) {
        setInvoices(invoicesData.invoices as Invoice[]);
      } else if (!loadedRef.current) {
        setInvoices(mockInvoices);
      }
    } catch {
      if (!loadedRef.current) {
        setCalls(mockCalls);
        setInvoices(mockInvoices);
      }
    } finally {
      loadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    void refreshData();
    const interval = setInterval(() => {
      void refreshData();
    }, 15000);

    return () => clearInterval(interval);
  }, [refreshData]);

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
  const availableInvoices = invoices.length > 0 ? invoices : mockInvoices;

  async function saveContact(payload: { invoiceId: string; clientName: string; clientPhone: string }) {
    await fetch("/api/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoice_id: payload.invoiceId,
        client_name: payload.clientName,
        client_phone: payload.clientPhone,
      }),
    });

    void refreshData();
  }

  async function initiateCall(payload: { invoiceId: string; clientName: string; clientPhone: string; notes: string; saveContact: boolean }) {
    const invoice = availableInvoices.find((i) => i.id === payload.invoiceId);
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
        persist_contact: payload.saveContact,
      }),
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    if (data.call) {
      setCalls((prev) => [data.call, ...prev]);
    }
    void refreshData();
  }

  return (
    <AppShell title="AI Calls" businessName="The Cobblestone Kitchen" monzoConnected>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">AI Calls</h2>
            <p className="text-sm text-muted-foreground">Manage live invoice chasing calls and outcomes.</p>
          </div>
          <InitiateCallModal invoices={availableInvoices} onInitiate={initiateCall} onSaveContact={saveContact} />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card className="border-border/70 bg-card/80">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total calls made</p>
              <p className="text-2xl font-semibold">{totals.count}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/80">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total collected</p>
              <p className="text-2xl font-semibold">EUR {(totals.collected / 100).toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/80">
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
