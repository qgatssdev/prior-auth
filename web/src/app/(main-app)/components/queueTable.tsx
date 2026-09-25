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
import { formatDay } from "@/utils/dates";
import type { PriorAuthCase } from "@/services/prior-auths/types";
import { DueLabel } from "@/common/dueLabel";
import { InitialsAvatar } from "@/common/initialsAvatar";
import { RelativeTime } from "@/common/relativeTime";
import { fullName, getApiErrorMessage } from "@/utils/helpers";
import { StatusBadge } from "@/common/statusBadge";

const COLUMNS = [
  "Patient",
  "Treatment",
  "Payer",
  "Status",
  "Service date",
  "Due",
  "Last update",
];

interface QueueTableProps {
  items: PriorAuthCase[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export default function QueueTable({
  items,
  isLoading,
  error,
  onRetry,
}: QueueTableProps) {
  const router = useRouter();

  if (error) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <span>Couldn&apos;t load the queue: {getApiErrorMessage(error)}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  const open = (id: string) => router.push(`/cases/${id}`);

  return (
    <>
      {/* Phones: one card per case. A 7-column table can't fit a narrow screen. */}
      <div className="flex flex-col gap-3 md:hidden">
        {isLoading &&
          Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}

        {!isLoading && items.length === 0 && (
          <p className="bg-background text-muted-foreground rounded-lg border py-10 text-center text-sm">
            No cases here. Nice work.
          </p>
        )}

        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => open(item.id)}
            className="bg-background flex flex-col gap-2 rounded-lg border p-4 text-left text-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <InitialsAvatar {...item.patient} />
                <div className="min-w-0">
                  <div className="font-medium">{fullName(item.patient)}</div>
                  <div className="text-muted-foreground text-xs">
                    {item.coverage.memberId}
                  </div>
                </div>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <div>
              {item.treatmentName}
              <span className="text-muted-foreground">
                {" "}
                · {item.payer.name}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span>
                Due <DueLabel dueBy={item.dueBy} />
              </span>
              <span className="text-muted-foreground">
                <RelativeTime iso={item.updatedAt} />
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-background hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((column) => (
                <TableHead
                  key={column}
                  className="text-muted-foreground px-4 text-xs font-medium tracking-wide uppercase"
                >
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
                <TableCell
                  colSpan={COLUMNS.length}
                  className="text-muted-foreground py-12 text-center"
                >
                  No cases here. Nice work.
                </TableCell>
              </TableRow>
            )}

            {items.map((item) => (
              <TableRow
                key={item.id}
                tabIndex={0}
                onClick={() => open(item.id)}
                onKeyDown={(e) => e.key === "Enter" && open(item.id)}
                className="cursor-pointer"
              >
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <InitialsAvatar {...item.patient} />
                    <div>
                      <div className="font-medium">
                        {fullName(item.patient)}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {item.coverage.memberId}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4">
                  <div>{item.treatmentName}</div>
                  <div className="text-muted-foreground text-xs">
                    {item.cptCode}
                  </div>
                </TableCell>
                <TableCell className="px-4">{item.payer.name}</TableCell>
                <TableCell className="px-4">
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell className="px-4 whitespace-nowrap">
                  {formatDay(item.serviceDate)}
                </TableCell>
                <TableCell className="px-4">
                  <DueLabel dueBy={item.dueBy} />
                </TableCell>
                <TableCell className="text-muted-foreground px-4">
                  <RelativeTime iso={item.updatedAt} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
