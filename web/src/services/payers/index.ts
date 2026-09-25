import { APIResponse } from "@/common/types";
import apiHandler from "../api";
import PayersRoute from "./payers.route";
import { Payer } from "./types";

export const getPayers = async () => {
  const response = await apiHandler.get<APIResponse<Payer[]>>(
    PayersRoute.getPayers
  );
  return response.data.data;
};
