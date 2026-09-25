"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDay } from "@/lib/dates";
import type { PriorAuthCase } from "@/lib/types";
import { DueLabel } from "./due-label";
import { RelativeTime } from "./relative-time";
import { StatusBadge } from "./status-badge";

const COLUMNS = ["Patient", "Treatment", "Payer", "Status", "Service date", "Due", "Last update"];

interface QueueTableProps {
  items: PriorAuthCase[];
  isLoading: boolean;
  error: Error | undefined;
  onRetry: () => void;
}

export function QueueTable({ items, isLoading, error, onRetry }: QueueTableProps) {
  const router = useRouter();

  if (error) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <span>Couldn&apos;t load the queue: {error.message}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((column) => (
              <TableHead key={column} className="px-4">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 6 }, (_, row) => (
              <TableRow key={row}>
                {COLUMNS.map((column) => (
                  <TableCell key={column} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading && items.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMNS.length} className="py-12 text-center text-muted-foreground">
                No cases here. Nice work.
              </TableCell>
            </TableRow>
          )}

          {items.map((item) => (
            <TableRow
              key={item.id}
              tabIndex={0}
              onClick={() => router.push(`/cases/${item.id}`)}
              onKeyDown={(e) => e.key === "Enter" && router.push(`/cases/${item.id}`)}
              className="cursor-pointer"
            >
              <TableCell className="px-4 py-3">
                <div className="font-medium">
                  {item.patient.lastName}, {item.patient.firstName}
                </div>
                <div className="text-xs text-muted-foreground">{item.coverage.memberId}</div>
              </TableCell>
              <TableCell className="px-4">
                <div>{item.treatmentName}</div>
                <div className="text-xs text-muted-foreground">{item.cptCode}</div>
              </TableCell>
              <TableCell className="px-4">{item.payer.name}</TableCell>
              <TableCell className="px-4">
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell className="px-4 whitespace-nowrap">{formatDay(item.serviceDate)}</TableCell>
              <TableCell className="px-4">
                <DueLabel dueBy={item.dueBy} />
              </TableCell>
              <TableCell className="px-4 text-muted-foreground">
                <RelativeTime iso={item.updatedAt} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
