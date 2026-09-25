import { buildQueryParams } from "@/utils/queryParams";
import { baseUrl } from "../index.route";
import { QueueParams } from "./types";

const PriorAuthsRoute = {
  getQueue: (params: QueueParams) =>
    `${baseUrl}/prior-auths${buildQueryParams(params)}`,
  getCase: (id: string) => `${baseUrl}/prior-auths/${id}`,
  createCase: `${baseUrl}/prior-auths`,
  transitionCase: (id: string) => `${baseUrl}/prior-auths/${id}/transition`,
};

export default PriorAuthsRoute;
