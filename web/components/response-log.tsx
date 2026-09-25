import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SimulatorMode } from "@/lib/types";

export interface LogEntry {
  id: number;
  time: string; // "12:04:10"
  mode: SimulatorMode;
  httpStatus: number;
  outcome: string; // the webhook result, or its error message
  reference: string;
}

// Green = applied, gray = duplicate ignored, red = anything that was refused.
function colorFor({ httpStatus, outcome }: LogEntry) {
  if (outcome === "applied") return "text-green-700";
  if (outcome === "duplicate_ignored") return "text-muted-foreground";
  if (httpStatus >= 400 || outcome === "rejected_invalid_transition" || outcome === "case_not_found") {
    return "text-red-700";
  }
  return "";
}

export function ResponseLog({ entries }: { entries: LogEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Response log</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing sent yet.</p>
        ) : (
          <ol className="flex flex-col gap-1 font-mono text-sm">
            {entries.map((entry) => (
              <li key={entry.id} className={colorFor(entry)}>
                {entry.time} · {entry.mode} · {entry.httpStatus} · {entry.outcome}
                <span className="text-muted-foreground"> ({entry.reference})</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
