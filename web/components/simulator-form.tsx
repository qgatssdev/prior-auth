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
import { PAYER_WORD_LABEL, PAYER_WORD_STATUS, STATUS } from "@/lib/status";
import { SearchableSelect } from "./searchable-select";
import { fullName } from "@/lib/utils";
import type {
  CaseDetail,
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
  const [chosenStatus, setChosenStatus] = useState<PayerStatusWord>("pending");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const options =
    selected && !openCases.some((c) => c.id === selected.id) ? [selected, ...openCases] : openCases;

  // Offer only updates the lifecycle accepts for this case right now (the API says which),
  // so the insurer can't "send" a move that would just be rejected.
  const { data: detail, mutate: mutateDetail } = useSWR<CaseDetail>(
    selected ? paths.case(selected.id) : null,
    fetcher,
    { refreshInterval: 5000 },
  );
  const validWords = STATUS_WORDS.filter((word) =>
    detail?.insurerActions.includes(PAYER_WORD_STATUS[word]),
  );
  // If the chosen status stops being valid (e.g. the case moved on), fall back to the first valid one.
  const status = validWords.includes(chosenStatus) ? chosenStatus : validWords[0];
  const current = detail ?? selected;

  async function send(mode: SimulatorMode) {
    if (!selected?.payerReference) return;
    setBusy(true);
    try {
      const result = await simulate(selected.payer.slug, {
        payerReference: selected.payerReference,
        // Duplicate and bad-signature sends don't depend on the status, so any word will do.
        status: status ?? "pending",
        note: note.trim() || undefined,
        mode,
      });
      onResult(mode, selected.payerReference, result);
      void mutate();
      void mutateDetail();
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
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Case</span>
          {/* Searchable: type a patient name or a reference such as ACME-70628. */}
          <SearchableSelect
            value={selected?.id ?? ""}
            onChange={(id) => setSelected(options.find((c) => c.id === id) ?? null)}
            options={options.map((c) => ({
              value: c.id,
              searchText: `${fullName(c.patient)} · ${c.payerReference} · ${STATUS[c.status].label}`,
            }))}
            placeholder="Choose an open, submitted case"
            searchPlaceholder="Search by patient or reference…"
            emptyText="No open case matches."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Status to send</span>
            <Select
              value={status ?? ""}
              onValueChange={(value) => setChosenStatus(value as PayerStatusWord)}
              disabled={validWords.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={selected ? "Nothing to send" : "Choose a case first"} />
              </SelectTrigger>
              <SelectContent>
                {validWords.map((word) => (
                  <SelectItem key={word} value={word}>
                    {PAYER_WORD_LABEL[word]}
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
          <Button disabled={!selected || !status || busy} onClick={() => send("normal")}>
            Send
          </Button>
          <Button variant="outline" disabled={!selected || busy} onClick={() => send("duplicate")}>
            Send duplicate
          </Button>
          <Button variant="outline" disabled={!selected || busy} onClick={() => send("bad_signature")}>
            Send with bad signature
          </Button>
        </div>
        {selected && detail && validWords.length === 0 && current && (
          <p className="text-sm text-muted-foreground">
            This case is {STATUS[current.status].label.toLowerCase()}, so the insurer has no decision
            to send. You can still send a duplicate or a bad signature.
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Send duplicate re-sends the exact last event sent to this payer, like an insurer retry.
        </p>
      </CardContent>
    </Card>
  );
}
