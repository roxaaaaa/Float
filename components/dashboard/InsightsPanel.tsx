"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, RefreshCw, X } from "lucide-react";

import type { AIInsight } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function iconFor(type: AIInsight["type"]) {
  if (type === "critical") return <AlertCircle className="h-4 w-4 text-red-400" />;
  if (type === "warning") return <AlertTriangle className="h-4 w-4 text-amber-400" />;
  if (type === "opportunity") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  return <Info className="h-4 w-4 text-primary" />;
}

function borderFor(type: AIInsight["type"]) {
  if (type === "critical") return "border-red-500/40";
  if (type === "warning") return "border-amber-500/40";
  if (type === "opportunity") return "border-emerald-500/40";
  return "border-primary/40";
}

export function InsightsPanel({
  insights,
  onDismiss,
}: {
  insights: AIInsight[];
  onDismiss?: (insight: AIInsight) => void;
}) {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Float AI Insights</CardTitle>
        <Button variant="ghost" size="icon" className="rounded-lg">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length === 0 && <p className="text-sm text-muted-foreground">No active insights.</p>}
        <AnimatePresence mode="popLayout">
          {insights.map((insight) => (
            <motion.div
              key={insight.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`rounded-lg border bg-card p-3 ${borderFor(insight.type)}`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {iconFor(insight.type)}
                  <h4 className="text-sm font-semibold">{insight.title}</h4>
                </div>
                <button className="text-muted-foreground hover:text-foreground" onClick={() => onDismiss?.(insight)}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{insight.message}</p>
              {insight.action_label && <Button className="mt-3 h-8 text-xs">{insight.action_label}</Button>}
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
