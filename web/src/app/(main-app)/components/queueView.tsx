"use client";

import { ClipboardList } from "lucide-react";
import { useState } from "react";
import PageHeader from "@/components/layout/pageHeader";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useQueue } from "@/services/prior-auths/queries";
import NewRequestSheet from "./newRequestSheet";
import QueueFilters, { type QueueTab } from "./queueFilters";
import QueueTable from "./queueTable";
import StatCards from "./statCards";

export default function QueueView() {
  const [tab, setTab] = useState<QueueTab>("OPEN");
  const [payerId, setPayerId] = useState<string>();
  const [sheetOpen, setSheetOpen] = useState(false);

  const {
    data,
    error,
    isLoading,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useQueue({ status: tab, payerId });
  const items = data?.pages.flatMap((page) => page.items) ?? [];

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={ClipboardList} title="Prior Authorization Requests" />
      <StatCards onSelect={setTab} />
      <QueueFilters
        tab={tab}
        payerId={payerId}
        onTabChange={setTab}
        onPayerChange={setPayerId}
        onNewRequest={() => setSheetOpen(true)}
      />
      <QueueTable
        items={items}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
      />
      {hasNextPage && !error && (
        <div
          ref={sentinelRef}
          className="text-muted-foreground flex h-10 items-center justify-center text-sm"
        >
          {isFetchingNextPage && "Loading more…"}
        </div>
      )}
      <NewRequestSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
