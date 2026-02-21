import type { BenchmarkMetricResult } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function statusBadge(status: BenchmarkMetricResult["status"]) {
  if (status === "red") return <Badge variant="destructive">High gap</Badge>;
  if (status === "amber") return <Badge variant="warning">Watch</Badge>;
  return <Badge variant="success">Good</Badge>;
}

export function BenchmarkPanel({
  rows,
  title,
}: {
  rows: BenchmarkMetricResult[];
  title: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Industry Benchmarks</CardTitle>
        <Badge variant="secondary">{title}</Badge>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>You</TableHead>
              <TableHead>Industry Avg</TableHead>
              <TableHead>Gap</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell>{row.label}</TableCell>
                <TableCell>{row.you}</TableCell>
                <TableCell>{row.average}</TableCell>
                <TableCell>{row.gap}</TableCell>
                <TableCell>{statusBadge(row.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-3 text-xs text-muted-foreground">
          Benchmarks from anonymised aggregate data across similar businesses.
        </p>
      </CardContent>
    </Card>
  );
}
