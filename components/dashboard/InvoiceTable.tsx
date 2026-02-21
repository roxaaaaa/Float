"use client";

import { MoreHorizontal, Phone, Upload } from "lucide-react";

import type { Invoice } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function statusBadge(status: Invoice["status"]) {
  if (status === "paid") return <Badge variant="success">Paid</Badge>;
  if (status === "overdue") return <Badge variant="warning">Overdue</Badge>;
  if (status === "chasing") return <Badge variant="warning">Chasing</Badge>;
  if (status === "disputed") return <Badge variant="destructive">Disputed</Badge>;
  return <Badge variant="secondary">Unpaid</Badge>;
}

export function InvoiceTable({
  invoices,
  onChase,
  onSendLink,
}: {
  invoices: Invoice[];
  onChase?: (invoice: Invoice) => void;
  onSendLink?: (invoice: Invoice) => void;
}) {
  return (
    <Card id="invoices">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Invoices</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Upload PDF
          </Button>
          <Button size="sm">Add Invoice</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.client_name}</TableCell>
                <TableCell className="font-mono text-xs">{invoice.invoice_number ?? "-"}</TableCell>
                <TableCell>EUR {(invoice.amount / 100).toFixed(2)}</TableCell>
                <TableCell>{invoice.due_date ?? "-"}</TableCell>
                <TableCell>{statusBadge(invoice.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onSendLink?.(invoice)}>
                      Send Link
                    </Button>
                    <Button variant={invoice.status === "overdue" ? "destructive" : "secondary"} size="sm" onClick={() => onChase?.(invoice)}>
                      <Phone className="mr-1 h-3.5 w-3.5" />
                      Chase
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Mark Paid</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-3 text-sm text-muted-foreground">
          Total outstanding: EUR {(invoices.filter((i) => i.status !== "paid").reduce((sum, i) => sum + i.amount, 0) / 100).toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
}
