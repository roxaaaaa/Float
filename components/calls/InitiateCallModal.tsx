"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Invoice } from "@/lib/types";

export function InitiateCallModal({
  invoices,
  onInitiate,
}: {
  invoices: Invoice[];
  onInitiate?: (payload: { invoiceId: string; clientName: string; clientPhone: string; notes: string }) => void;
}) {
  const defaultInvoice = invoices.find((i) => i.status === "overdue") ?? invoices[0];
  const [clientName, setClientName] = useState(defaultInvoice?.client_name ?? "");
  const [clientPhone, setClientPhone] = useState(defaultInvoice?.client_phone ?? "");
  const [notes, setNotes] = useState("Be firm about Friday deadline.");

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
          <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client name" />
          <Input value={clientPhone ?? ""} onChange={(e) => setClientPhone(e.target.value)} placeholder="Client phone" />
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button
            onClick={() => {
              if (!defaultInvoice) return;
              onInitiate?.({
                invoiceId: defaultInvoice.id,
                clientName,
                clientPhone: clientPhone ?? "",
                notes,
              });
            }}
          >
            Initiate Call
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
