"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CallRecord } from "@/lib/types";

export function LiveCallPanel({ call }: { call: CallRecord | null }) {
  if (!call) return null;

  return (
    <Card className="border-red-500/40">
      <CardHeader>
        <CardTitle className="text-red-300">Live Call Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{call.client_name}</p>
        <p className="text-xs text-muted-foreground">{call.client_phone}</p>
        <p className="mt-2 text-xs text-muted-foreground">Duration: {call.duration_seconds ?? 0}s</p>
        <div className="mt-3 flex h-10 items-end gap-1">
          {Array.from({ length: 16 }).map((_, idx) => (
            <span
              key={idx}
              className="w-1 rounded-sm bg-primary animate-wave"
              style={{ height: `${15 + ((idx * 9) % 25)}px`, animationDuration: `${0.45 + (idx % 4) * 0.2}s` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
