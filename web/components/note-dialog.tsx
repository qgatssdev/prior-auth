"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface NoteDialogProps {
  title: string | null; // null = closed
  busy: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

export function NoteDialog({ title, busy, onConfirm, onCancel }: NoteDialogProps) {
  const [note, setNote] = useState("");

  return (
    <Dialog
      open={title !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
        setNote("");
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>A note is required for this step. It is saved to the timeline.</DialogDescription>
        </DialogHeader>
        <Textarea
          autoFocus
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What changed, or what was sent?"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(note.trim())} disabled={busy || !note.trim()}>
            {busy ? "Saving…" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
