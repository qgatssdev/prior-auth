import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { LIVE_REFRESH_MS } from "@/config";
import { getCase, getQueue } from ".";
import { QueueParams } from "./types";

// Both queue shapes share the "queue" root, so invalidating ["queue"] refreshes both.
export const queueKey = ["queue"];

/**
 * The queue, one page per cursor, loaded as the list scrolls. A refetch
 * re-fetches every loaded page, so the whole visible list stays live.
 */
export const useQueue = (params: Omit<QueueParams, "cursor">) => {
  return useInfiniteQuery({
    queryKey: [...queueKey, "infinite", params],
    queryFn: ({ pageParam }) => getQueue({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval: LIVE_REFRESH_MS,
  });
};

// A single page of the queue, for pickers that need the list, not scrolling.
export const useQueuePage = (params: QueueParams) => {
  return useQuery({
    queryKey: [...queueKey, "page", params],
    queryFn: () => getQueue(params),
    refetchInterval: LIVE_REFRESH_MS,
  });
};

export const caseKey = (id: string) => ["case", id];

// id is undefined while nothing is selected (the demo picker); the query waits.
export const useCase = (id: string | undefined) => {
  return useQuery({
    queryKey: ["case", id],
    queryFn: () => getCase(id!),
    enabled: !!id,
    refetchInterval: LIVE_REFRESH_MS,
  });
};
