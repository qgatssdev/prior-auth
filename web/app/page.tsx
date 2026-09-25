"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";
import { LoadMoreButton } from "@/components/load-more-button";
import { NewRequestSheet } from "@/components/new-request-sheet";
import { QueueFilters, type QueueTab } from "@/components/queue-filters";
import { QueueTable } from "@/components/queue-table";
import { StatCards } from "@/components/stat-cards";
import { fetcher, paths } from "@/lib/api";
import type { QueuePage as QueuePageData } from "@/lib/types";

export default function QueuePage() {
  const [tab, setTab] = useState<QueueTab>("OPEN");
  const [payerId, setPayerId] = useState<string>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { mutate: mutateKey } = useSWRConfig();

  // One SWR key per page: the next page's key uses the previous page's nextCursor.
  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite<QueuePageData>(
    (_index, previous) =>
      previous && !previous.nextCursor
        ? null
        : paths.queue({ status: tab, payerId, cursor: previous?.nextCursor ?? undefined }),
    fetcher,
    // revalidateAll: the 5-second refresh updates every loaded page, not just the first.
    { refreshInterval: 5000, revalidateAll: true },
  );

  const items = data?.flatMap((page) => page.items) ?? [];
  const hasMore = Boolean(data?.[data.length - 1]?.nextCursor);
  const loadingMore = size > (data?.length ?? 0);

  // After a create or submit, refresh now instead of waiting for the 5-second poll.
  const refresh = () => {
    void mutate();
    void mutateKey(paths.stats);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Prior auth queue</h1>
      <StatCards onSelect={setTab} />
      <QueueFilters
        tab={tab}
        payerId={payerId}
        onTabChange={setTab}
        onPayerChange={setPayerId}
        onNewRequest={() => setSheetOpen(true)}
      />
      <QueueTable items={items} isLoading={isLoading} error={error} onRetry={() => mutate()} />
      {hasMore && !error && (
        <LoadMoreButton loading={loadingMore} onClick={() => setSize(size + 1)} />
      )}
      <NewRequestSheet open={sheetOpen} onOpenChange={setSheetOpen} onChanged={refresh} />
    </div>
  );
}
