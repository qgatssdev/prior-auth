import { APIResponse } from "@/common/types";
import apiHandler from "../api";
import PriorAuthsRoute from "./prior-auths.route";
import {
  CaseDetail,
  CreateCasePayload,
  PriorAuthCase,
  QueuePage,
  QueueParams,
  TransitionPayload,
} from "./types";

export const getQueue = async (params: QueueParams) => {
  const response = await apiHandler.get<APIResponse<QueuePage>>(
    PriorAuthsRoute.getQueue(params)
  );
  return response.data.data;
};

export const getCase = async (id: string) => {
  const response = await apiHandler.get<APIResponse<CaseDetail>>(
    PriorAuthsRoute.getCase(id)
  );
  return response.data.data;
};

export const createCase = async (payload: CreateCasePayload) => {
  const response = await apiHandler.post<APIResponse<PriorAuthCase>>(
    PriorAuthsRoute.createCase,
    payload
  );
  return response.data.data;
};

export const transitionCase = async (
  id: string,
  payload: TransitionPayload
) => {
  const response = await apiHandler.post<APIResponse<PriorAuthCase>>(
    PriorAuthsRoute.transitionCase(id),
    payload
  );
  return response.data.data;
};
