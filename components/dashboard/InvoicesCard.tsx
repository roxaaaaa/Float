import { ReceiptText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function InvoicesCard({ outstanding, count, overdue }: { outstanding: number; count: number; overdue: number }) {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Outstanding Invoices</p>
          <ReceiptText className="h-4 w-4 text-primary" />
        </div>
        <p className="mt-3 font-mono text-3xl font-semibold tabular-nums">EUR {(outstanding / 100).toFixed(2)}</p>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{count} invoices</span>
          <Badge variant={overdue > 0 ? "destructive" : "secondary"}>{overdue} overdue</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
