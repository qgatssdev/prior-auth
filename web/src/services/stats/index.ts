import { APIResponse } from "@/common/types";
import apiHandler from "../api";
import StatsRoute from "./stats.route";
import { Stats } from "./types";

export const getStats = async () => {
  const response = await apiHandler.get<APIResponse<Stats>>(
    StatsRoute.getStats
  );
  return response.data.data;
};
