"use client";

import { AlertTriangle } from "lucide-react";

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
  if (riskLevel === "healthy") {
    return (
      <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4">
        <p className="text-sm text-emerald-300">Cashflow healthy - {runwayDays} days of runway. Payroll covered. No action needed.</p>
      </div>
    );
  }

  if (riskLevel === "warning") {
    return (
      <div className="flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
        <p className="text-sm text-amber-200">Cashflow warning - Runway is {runwayDays} days. Consider acting soon.</p>
        <Button variant="outline">View Invoices</Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-5">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-400" />
        <h3 className="text-base font-semibold text-red-200">PAYROLL AT RISK</h3>
        <Badge variant="destructive">P1</Badge>
      </div>
      <p className="text-sm text-red-200">Shortfall: {shortfall ? `EUR ${(shortfall / 100).toFixed(2)}` : "Unknown"} before next payroll.</p>
      <div className="mt-4 flex gap-2">
        <Button size="lg" className="bg-red-600 hover:bg-red-700" onClick={onFixIt}>
          Fix It Now
        </Button>
        <Button variant="outline">Declare Mayday</Button>
      </div>
    </div>
  );
}
