"use client";

import { Area, AreaChart, CartesianGrid, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Projection } from "@/lib/types";
import { formatDateLabel } from "@/lib/utils";

export function CashflowChart({ projections, payrollThreshold }: { projections: Projection[]; payrollThreshold: number }) {
  const chartData = projections.map((p) => ({
    date: formatDateLabel(p.projection_date),
    balance: p.projected_balance / 100,
    projected: p.projected_balance / 100,
    belowThreshold: p.projected_balance < payrollThreshold,
    raw: p,
  }));

  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cashflow Forecast</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">30-day projection with payroll threshold monitoring</p>
        </div>
        <div className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Powered by Claude AI</div>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              formatter={(value: number | string | Array<number | string> | undefined) => [
                `EUR ${Number(Array.isArray(value) ? value[0] : value ?? 0).toFixed(2)}`,
                "Projected balance",
              ]}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
              }}
            />
            <ReferenceLine y={payrollThreshold / 100} stroke="#f59e0b" strokeDasharray="4 4" />
            <ReferenceLine y={0} stroke="#fafafa" strokeOpacity={0.25} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1) / 0.16)"
              strokeWidth={2.3}
              isAnimationActive
              animationDuration={900}
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke="hsl(var(--chart-1))"
              strokeDasharray="6 6"
              strokeOpacity={0.8}
              dot={false}
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
