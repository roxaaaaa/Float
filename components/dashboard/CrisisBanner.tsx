"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock4 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RiskLevel } from "@/lib/types";

export function CrisisBanner({
  riskLevel,
  runwayDays,
  shortfall,
  onFixIt,
}: {
  riskLevel: RiskLevel;
  runwayDays: number;
  shortfall: number | null;
  onFixIt?: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(47 * 3600 + 23 * 60 + 14);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    const hours = Math.floor(secondsLeft / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;
    return `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(2, "0")}`;
  }, [secondsLeft]);

  if (riskLevel === "healthy") {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
        <p className="text-sm text-emerald-300">
          Cashflow healthy. {runwayDays} days of runway, payroll fully covered, no intervention needed.
        </p>
      </div>
    );
  }

  if (riskLevel === "warning") {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-amber-200">
          Cashflow warning. Runway is {runwayDays} days and one or more invoices are overdue.
        </p>
        <Button variant="outline">View Invoices</Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-5 shadow-[0_0_0_1px_hsl(0_84%_60%/0.2)]">
      <div className="mb-2 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-400" />
        <h3 className="text-base font-semibold text-red-200">PAYROLL AT RISK</h3>
        <Badge variant="destructive">P1</Badge>
      </div>
      <p className="text-sm text-red-200">
        Next payroll has a projected shortfall of {shortfall ? `EUR ${(shortfall / 100).toFixed(2)}` : "unknown amount"}.
      </p>
      <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 font-mono text-sm tabular-nums text-red-200">
        <Clock4 className="h-4 w-4" />
        {countdown}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="lg" className="animate-pulse bg-red-600 hover:bg-red-700" onClick={onFixIt}>
          Fix It Now
        </Button>
        <Button variant="outline">Declare Mayday</Button>
      </div>
    </div>
  );
}
