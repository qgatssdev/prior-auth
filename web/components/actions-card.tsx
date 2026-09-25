"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { transitionCase } from "@/lib/api";
import { actionLabel, noteRequired, STATUS } from "@/lib/status";
import type { CaseDetail, PriorAuthStatus } from "@/lib/types";
import { NoteDialog } from "./note-dialog";

export function ActionsCard({ data, onChanged }: { data: CaseDetail; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  // The target status waiting for a note, while the note dialog is open.
  const [noteFor, setNoteFor] = useState<PriorAuthStatus | null>(null);

  async function move(toStatus: PriorAuthStatus, note?: string) {
    setBusy(true);
    try {
      await transitionCase(data.id, { toStatus, note });
      toast.success(`Moved to ${STATUS[toStatus].label}`);
      setNoteFor(null);
      onChanged();
    } catch (error) {
      // For example a 409 if the insurer changed the case a moment ago.
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function onAction(toStatus: PriorAuthStatus) {
    if (noteRequired(data.status, toStatus)) setNoteFor(toStatus);
    else void move(toStatus);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {data.allowedActions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {data.isFinal
              ? "Final status. No further actions."
              : "Waiting on the insurer. Their decision will appear here automatically."}
          </p>
        )}
        {data.allowedActions.map((toStatus, index) => (
          <Button
            key={toStatus}
            // The first allowed move is the usual next step; the rest are secondary.
            variant={index === 0 ? "default" : "outline"}
            disabled={busy}
            onClick={() => onAction(toStatus)}
          >
            {actionLabel(data.status, toStatus)}
          </Button>
        ))}
      </CardContent>

      <NoteDialog
        title={noteFor && actionLabel(data.status, noteFor)}
        busy={busy}
        onConfirm={(note) => noteFor && move(noteFor, note)}
        onCancel={() => setNoteFor(null)}
      />
    </Card>
  );
}
