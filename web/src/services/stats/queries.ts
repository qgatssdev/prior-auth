import { useQuery } from "@tanstack/react-query";
import { LIVE_REFRESH_MS } from "@/config";
import { getStats } from ".";

export const statsKey = ["stats"];

export const useStats = () => {
  return useQuery({
    queryKey: statsKey,
    queryFn: getStats,
    refetchInterval: LIVE_REFRESH_MS,
  });
};
