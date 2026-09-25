"use client";

import { FlaskConical } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { type LogEntry, ResponseLog } from "@/components/response-log";
import { SimulatorForm } from "@/components/simulator-form";
import type { SimulateResult, SimulatorMode } from "@/lib/types";

// The webhook's result on success, or its error message (e.g. "Invalid signature").
function outcomeOf({ body }: SimulateResult) {
  if (body.data?.result) return body.data.result;
  return Array.isArray(body.message) ? body.message.join(", ") : (body.message ?? "unknown");
}

export default function DemoPage() {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  function addEntry(mode: SimulatorMode, reference: string, result: SimulateResult) {
    const entry: LogEntry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString("en-GB"),
      mode,
      httpStatus: result.httpStatus,
      outcome: outcomeOf(result),
      reference,
    };
    setEntries((current) => [entry, ...current]); // newest first
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={FlaskConical} title="Demo tools" />
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
        Demo tools. This page plays the insurer, to show how incoming updates are handled.
      </div>
      <SimulatorForm onResult={addEntry} />
      <ResponseLog entries={entries} />
    </div>
  );
}
