import { Card, CardContent } from "@/components/ui/card";

export function InvoicesCard({ outstanding, count, overdue }: { outstanding: number; count: number; overdue: number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Outstanding Invoices</p>
        <p className="mt-3 font-mono text-3xl font-semibold tabular-nums">EUR {(outstanding / 100).toFixed(2)}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {count} invoices - <span className={overdue > 0 ? "text-red-400" : ""}>{overdue} overdue</span>
        </p>
      </CardContent>
    </Card>
  );
}
