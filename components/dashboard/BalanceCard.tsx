import { Card, CardContent } from "@/components/ui/card";
import { formatCurrencyEurFromPence } from "@/lib/utils";

export function BalanceCard({ amount, trendPercent = 0 }: { amount: number; trendPercent?: number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Balance</p>
        <p className="mt-3 font-mono text-3xl font-semibold tabular-nums">{formatCurrencyEurFromPence(amount)}</p>
        <p className={`mt-2 text-xs ${trendPercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {trendPercent >= 0 ? "+" : ""}
          {trendPercent.toFixed(1)}% vs yesterday
        </p>
      </CardContent>
    </Card>
  );
}
