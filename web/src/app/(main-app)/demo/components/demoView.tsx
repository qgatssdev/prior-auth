"use client";

import { FlaskConical } from "lucide-react";
import { useState } from "react";
import PageHeader from "@/components/layout/pageHeader";
import type {
  SimulatePayload,
  SimulateResult,
} from "@/services/simulator/types";
import ResponseLog, { type LogEntry } from "./responseLog";
import SimulatorForm from "./simulatorForm";

// The webhook's result on success, or its error message (e.g. "Invalid signature").
function outcomeOf({ body }: SimulateResult) {
  if (body.data?.result) return body.data.result;
  return Array.isArray(body.message)
    ? body.message.join(", ")
    : (body.message ?? "unknown");
}

export default function DemoView() {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  function addEntry(result: SimulateResult, payload: SimulatePayload) {
    const entry: LogEntry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString("en-GB"),
      mode: payload.mode,
      httpStatus: result.httpStatus,
      outcome: outcomeOf(result),
      reference: payload.payerReference,
    };
    setEntries((current) => [entry, ...current]); // newest first
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={FlaskConical} title="Demo tools" />
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
        Demo tools. This page plays the insurer, to show how incoming updates
        are handled.
      </div>
      <SimulatorForm onResult={addEntry} />
      <ResponseLog entries={entries} />
    </div>
  );
}
