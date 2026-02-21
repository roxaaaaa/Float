import { Card, CardContent } from "@/components/ui/card";

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
    <Card className={atRisk ? "border-red-500/50 bg-red-500/5" : ""}>
      <CardContent className="p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Payroll Coverage</p>
        <p className={`mt-3 text-2xl font-semibold ${atRisk ? "text-red-400" : "text-emerald-400"}`}>
          {atRisk ? "AT RISK" : "Covered"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {atRisk ? `${(shortfall! / 100).toFixed(2)} shortfall` : "Buffer available above threshold"}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Next payroll: EUR {(payrollAmount / 100).toFixed(2)} - {payrollDay}</p>
      </CardContent>
    </Card>
  );
}
