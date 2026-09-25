"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStats } from "@/services/stats/queries";
import type { Stats } from "@/services/stats/types";
import { cn } from "@/lib/utils";
import type { QueueTab } from "./queueFilters";

const CARDS: {
  key: keyof Stats;
  label: string;
  color: string;
  tab: QueueTab;
}[] = [
  {
    key: "needsInfo",
    label: "Needs info",
    color: "text-orange-600",
    tab: "NEEDS_INFO",
  },
  {
    key: "pendingPayer",
    label: "Pending payer",
    color: "text-amber-600",
    tab: "PENDING",
  },
  // Not a status, so this opens the Open tab; the Due column shows which are urgent.
  {
    key: "dueSoon",
    label: "Due in 48 hours",
    color: "text-red-600",
    tab: "OPEN",
  },
  {
    key: "deniedAppealable",
    label: "Denied, can appeal",
    color: "text-purple-600",
    tab: "DENIED",
  },
];

export default function StatCards({
  onSelect,
}: {
  onSelect: (tab: QueueTab) => void;
}) {
  const { data } = useStats();

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {CARDS.map(({ key, label, color, tab }) => (
        <Card
          key={key}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(tab)}
          onKeyDown={(e) => e.key === "Enter" && onSelect(tab)}
          className="hover:bg-muted/60 cursor-pointer gap-1 px-4 py-3 transition-colors sm:px-5 sm:py-4"
        >
          {data ? (
            <span className={cn("text-3xl font-semibold tabular-nums", color)}>
              {data[key]}
            </span>
          ) : (
            <Skeleton className="h-9 w-12" />
          )}
          <span className="text-muted-foreground text-sm">{label}</span>
        </Card>
      ))}
    </div>
  );
}
