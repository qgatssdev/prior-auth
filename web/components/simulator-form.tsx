"use client";

import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetcher, paths, simulate } from "@/lib/api";
import { STATUS } from "@/lib/status";
import type {
  PayerStatusWord,
  PriorAuthCase,
  QueuePage,
  SimulateResult,
  SimulatorMode,
} from "@/lib/types";

const STATUS_WORDS: PayerStatusWord[] = ["pending", "needs_info", "approved", "denied"];

interface SimulatorFormProps {
  onResult: (mode: SimulatorMode, reference: string, result: SimulateResult) => void;
}

export function SimulatorForm({ onResult }: SimulatorFormProps) {
  const { data, mutate } = useSWR<QueuePage>(
    paths.queue({ status: "OPEN", limit: 100 }),
    fetcher,
    { refreshInterval: 5000 },
  );
  // Only submitted cases have a payer reference for the insurer to quote.
  const openCases = data?.items.filter((c) => c.payerReference) ?? [];

  // Kept even after the case leaves the OPEN list (e.g. once approved),
  // so "Send duplicate" still works for it.
  const [selected, setSelected] = useState<PriorAuthCase | null>(null);
  const [status, setStatus] = useState<PayerStatusWord>("pending");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const options =
    selected && !openCases.some((c) => c.id === selected.id) ? [selected, ...openCases] : openCases;

  async function send(mode: SimulatorMode) {
    if (!selected?.payerReference) return;
    setBusy(true);
    try {
      const result = await simulate(selected.payer.slug, {
        payerReference: selected.payerReference,
        status,
        note: note.trim() || undefined,
        mode,
      });
      onResult(mode, selected.payerReference, result);
      void mutate();
    } catch (error) {
      // The simulator itself refused, e.g. "Send a normal event to this payer first".
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send an insurer update</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Case</span>
          <Select
            value={selected?.id ?? ""}
            onValueChange={(id) => setSelected(options.find((c) => c.id === id) ?? null)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose an open, submitted case" />
            </SelectTrigger>
            <SelectContent>
              {options.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.patient.lastName}, {c.patient.firstName} · {c.payerReference} ·{" "}
                  {STATUS[c.status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <div className="grid grid-cols-[12rem_1fr] gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Status to send</span>
            <Select value={status} onValueChange={(value) => setStatus(value as PayerStatusWord)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_WORDS.map((word) => (
                  <SelectItem key={word} value={word}>
                    {word}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Note</span>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Please send the latest OCT scan"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button disabled={!selected || busy} onClick={() => send("normal")}>
            Send
          </Button>
          <Button variant="outline" disabled={!selected || busy} onClick={() => send("duplicate")}>
            Send duplicate
          </Button>
          <Button variant="outline" disabled={!selected || busy} onClick={() => send("bad_signature")}>
            Send with bad signature
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Send duplicate re-sends the exact last event sent to this payer, like an insurer retry.
        </p>
      </CardContent>
    </Card>
  );
}
