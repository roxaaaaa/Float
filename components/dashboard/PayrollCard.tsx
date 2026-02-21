import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PayrollCard({
  payrollAmount,
  shortfall,
  payrollDay,
}: {
  payrollAmount: number;
  shortfall: number | null;
  payrollDay: string;
}) {
  const atRisk = Boolean(shortfall && shortfall > 0);
  return (
    <Card className={atRisk ? "border-red-500/50 bg-red-500/5" : "border-border/70 bg-card/80"}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Payroll Coverage</p>
          <Badge variant={atRisk ? "destructive" : "success"}>{atRisk ? "At Risk" : "Covered"}</Badge>
        </div>
        <p className={`mt-3 text-2xl font-semibold ${atRisk ? "text-red-400" : "text-emerald-400"}`}>{atRisk ? "Action Required" : "On Track"}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {atRisk ? `EUR ${(shortfall! / 100).toFixed(2)} shortfall` : "Buffer available above threshold"}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Next payroll: EUR {(payrollAmount / 100).toFixed(2)} - {payrollDay}
        </p>
      </CardContent>
    </Card>
  );
}
