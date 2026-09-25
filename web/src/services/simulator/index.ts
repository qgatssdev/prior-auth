import { APIResponse } from "@/common/types";
import apiHandler from "../api";
import SimulatorRoute from "./simulator.route";
import { SimulatePayload, SimulateResult } from "./types";

export const simulate = async (slug: string, payload: SimulatePayload) => {
  const response = await apiHandler.post<APIResponse<SimulateResult>>(
    SimulatorRoute.send(slug),
    payload
  );
  return response.data.data;
};
