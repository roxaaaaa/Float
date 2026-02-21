"use client";

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Projection } from "@/lib/types";
import { formatDateLabel } from "@/lib/utils";

export function CashflowChart({ projections, payrollThreshold }: { projections: Projection[]; payrollThreshold: number }) {
  const chartData = projections.map((p) => ({
    date: formatDateLabel(p.projection_date),
    balance: p.projected_balance / 100,
    raw: p,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Cashflow Forecast</CardTitle>
        <div className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Powered by Claude AI</div>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
              }}
            />
            <ReferenceLine y={payrollThreshold / 100} stroke="#f59e0b" strokeDasharray="4 4" />
            <ReferenceLine y={0} stroke="#fafafa" strokeOpacity={0.25} />
            <Area type="monotone" dataKey="balance" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1) / 0.15)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
