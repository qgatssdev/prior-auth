import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MODE_LABEL, RESULT_LABEL } from "@/lib/status";
import type { SimulatorMode, WebhookResult } from "@/lib/types";

export interface LogEntry {
  id: number;
  time: string; // "12:04:10"
  mode: SimulatorMode;
  httpStatus: number;
  outcome: string; // the raw webhook result (e.g. "duplicate_ignored"), or its error message
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
          <ol className="flex flex-col gap-1 font-mono text-xs break-words sm:text-sm">
            {entries.map((entry) => (
              <li key={entry.id} className={colorFor(entry)}>
                {entry.time} · {MODE_LABEL[entry.mode]} · {entry.httpStatus} ·{" "}
                {/* Error messages are already readable; results get a label. */}
                {RESULT_LABEL[entry.outcome as WebhookResult] ?? entry.outcome}
                <span className="text-muted-foreground"> ({entry.reference})</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
