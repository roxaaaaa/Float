import { ArrowUpRight, Landmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrencyEurFromPence } from "@/lib/utils";

export function BalanceCard({ amount, trendPercent = 0 }: { amount: number; trendPercent?: number }) {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Balance</p>
          <Landmark className="h-4 w-4 text-primary" />
        </div>
        <p className="mt-3 font-mono text-3xl font-semibold tabular-nums">{formatCurrencyEurFromPence(amount)}</p>
        <p className={`mt-2 inline-flex items-center gap-1 text-xs ${trendPercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          <ArrowUpRight className="h-3 w-3" />
          {trendPercent >= 0 ? "+" : ""}
          {trendPercent.toFixed(1)}% vs yesterday
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Live from Monzo</p>
      </CardContent>
    </Card>
  );
}
