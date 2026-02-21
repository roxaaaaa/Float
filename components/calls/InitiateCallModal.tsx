"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Invoice } from "@/lib/types";

export function InitiateCallModal({
  invoices,
  onInitiate,
  onSaveContact,
}: {
  invoices: Invoice[];
  onInitiate?: (payload: { invoiceId: string; clientName: string; clientPhone: string; notes: string; saveContact: boolean }) => void;
  onSaveContact?: (payload: { invoiceId: string; clientName: string; clientPhone: string }) => void;
}) {
  const defaultInvoice = useMemo(() => invoices.find((i) => i.status === "overdue") ?? invoices[0], [invoices]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(defaultInvoice?.id ?? "");
  const selectedInvoice = useMemo(() => invoices.find((i) => i.id === selectedInvoiceId) ?? defaultInvoice, [defaultInvoice, invoices, selectedInvoiceId]);

  const [clientName, setClientName] = useState(defaultInvoice?.client_name ?? "");
  const [clientPhone, setClientPhone] = useState(defaultInvoice?.client_phone ?? "");
  const [notes, setNotes] = useState("Be firm about Friday deadline.");
  const [saveContact, setSaveContact] = useState(true);

  useEffect(() => {
    if (!selectedInvoice) return;
    setClientName(selectedInvoice.client_name ?? "");
    setClientPhone(selectedInvoice.client_phone ?? "");
  }, [selectedInvoice]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>New Call +</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Initiate AI Call</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Invoice</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={selectedInvoiceId}
              onChange={(event) => {
                const next = invoices.find((invoice) => invoice.id === event.target.value);
                setSelectedInvoiceId(event.target.value);
                setClientName(next?.client_name ?? "");
                setClientPhone(next?.client_phone ?? "");
              }}
            >
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {(invoice.invoice_number ?? "Manual")} - {invoice.client_name}
                </option>
              ))}
            </select>
          </div>
          <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client name" />
          <Input value={clientPhone ?? ""} onChange={(e) => setClientPhone(e.target.value)} placeholder="Client phone" />
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="rounded-md border border-border/70 bg-card/50 p-3 text-xs text-muted-foreground">
            Script preview: Hi {clientName || "there"}, this is Float AI assistant regarding invoice{" "}
            {selectedInvoice?.invoice_number ?? "your invoice"} for EUR {((selectedInvoice?.amount ?? 0) / 100).toFixed(2)}.
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={saveContact} onChange={(event) => setSaveContact(event.target.checked)} />
            Save number to invoice
          </label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (!selectedInvoice) return;
                onSaveContact?.({
                  invoiceId: selectedInvoice.id,
                  clientName: clientName.trim(),
                  clientPhone: (clientPhone ?? "").trim(),
                });
              }}
            >
              Save Contact
            </Button>
            <Button
              onClick={() => {
                if (!selectedInvoice) return;
                onInitiate?.({
                  invoiceId: selectedInvoice.id,
                  clientName: clientName.trim(),
                  clientPhone: (clientPhone ?? "").trim(),
                  notes,
                  saveContact,
                });
              }}
            >
              Initiate Call
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
