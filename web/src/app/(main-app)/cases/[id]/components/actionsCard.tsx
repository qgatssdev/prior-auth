"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransitionCase } from "@/services/prior-auths/mutation";
import type { CaseDetail, PriorAuthStatus } from "@/services/prior-auths/types";
import { getApiErrorMessage } from "@/utils/helpers";
import { actionLabel, noteRequired, STATUS } from "@/utils/status";
import NoteDialog from "./noteDialog";

export default function ActionsCard({ data }: { data: CaseDetail }) {
  // The target status waiting for a note, while the note dialog is open.
  const [noteFor, setNoteFor] = useState<PriorAuthStatus | null>(null);

  const { mutate: transition, isPending: busy } = useTransitionCase(
    (moved) => {
      toast.success(`Moved to ${STATUS[moved.status].label}`);
      setNoteFor(null);
    },
    // For example a 409 if the insurer changed the case a moment ago.
    (error) => toast.error(getApiErrorMessage(error))
  );

  const move = (toStatus: PriorAuthStatus, note?: string) =>
    transition({ id: data.id, payload: { toStatus, note } });

  function onAction(toStatus: PriorAuthStatus) {
    if (noteRequired(data.status, toStatus)) setNoteFor(toStatus);
    else move(toStatus);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {data.allowedActions.length === 0 && (
          <p className="text-muted-foreground text-sm">
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
