"use client";

import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher, paths } from "@/lib/api";
import type { Stats } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { QueueTab } from "./queue-filters";

const CARDS: { key: keyof Stats; label: string; color: string; tab: QueueTab }[] = [
  { key: "needsInfo", label: "Needs info", color: "text-orange-600", tab: "NEEDS_INFO" },
  { key: "pendingPayer", label: "Pending payer", color: "text-amber-600", tab: "PENDING" },
  // Not a status: the Open tab is sorted by due date, so these come first.
  { key: "dueSoon", label: "Due in 48 hours", color: "text-red-600", tab: "OPEN" },
  { key: "deniedAppealable", label: "Denied, can appeal", color: "text-purple-600", tab: "DENIED" },
];

export function StatCards({ onSelect }: { onSelect: (tab: QueueTab) => void }) {
  const { data } = useSWR<Stats>(paths.stats, fetcher, { refreshInterval: 5000 });

  return (
    <div className="grid grid-cols-4 gap-4">
      {CARDS.map(({ key, label, color, tab }) => (
        <Card
          key={key}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(tab)}
          onKeyDown={(e) => e.key === "Enter" && onSelect(tab)}
          className="cursor-pointer gap-1 px-5 py-4 transition-colors hover:bg-muted/60"
        >
          {data ? (
            <span className={cn("text-3xl font-semibold tabular-nums", color)}>
              {data[key]}
            </span>
          ) : (
            <Skeleton className="h-9 w-12" />
          )}
          <span className="text-sm text-muted-foreground">{label}</span>
        </Card>
      ))}
    </div>
  );
}
