"use client";

import { Plus } from "lucide-react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetcher, paths } from "@/lib/api";
import type { Payer } from "@/lib/types";

// Each tab is a status value the API understands (a group or a single status).
export const QUEUE_TABS = [
  { value: "OPEN", label: "Open" },
  { value: "NEEDS_INFO", label: "Needs info" },
  { value: "PENDING", label: "Pending" },
  { value: "DENIED", label: "Denied" },
  { value: "ALL", label: "All" },
] as const;
export type QueueTab = (typeof QUEUE_TABS)[number]["value"];

const ALL_PAYERS = "all";

interface QueueFiltersProps {
  tab: QueueTab;
  payerId: string | undefined;
  onTabChange: (tab: QueueTab) => void;
  onPayerChange: (payerId: string | undefined) => void;
  onNewRequest: () => void;
}

export function QueueFilters({
  tab,
  payerId,
  onTabChange,
  onPayerChange,
  onNewRequest,
}: QueueFiltersProps) {
  const { data: payers } = useSWR<Payer[]>(paths.payers, fetcher);

  return (
    <div className="flex items-center gap-3">
      <Tabs value={tab} onValueChange={(value) => onTabChange(value as QueueTab)}>
        <TabsList>
          {QUEUE_TABS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value} className="px-3">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Select
        value={payerId ?? ALL_PAYERS}
        onValueChange={(value) => onPayerChange(value === ALL_PAYERS ? undefined : value)}
      >
        <SelectTrigger className="w-44 bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_PAYERS}>All payers</SelectItem>
          {payers?.map((payer) => (
            <SelectItem key={payer.id} value={payer.id}>
              {payer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button className="ml-auto" onClick={onNewRequest}>
        <Plus /> New request
      </Button>
    </div>
  );
}
