import type {
  CaseDetail,
  CreateCaseBody,
  Patient,
  Payer,
  PriorAuthCase,
  QueuePage,
  QueueParams,
  SimulateBody,
  SimulateResult,
  Stats,
  TransitionBody,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Validation errors come back as an array of messages, everything else as a string.
function errorMessage(body: unknown, status: number) {
  const message = (body as { message?: string | string[] } | null)?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message ?? `Request failed (${status})`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // Content-Type only when sending a body: on a GET it would make the browser send
  // an extra CORS preflight (OPTIONS) request before every poll.
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json", ...init.headers } : init?.headers,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(errorMessage(body, response.status));
  }
  return (body as { data: T }).data;
}

// SWR fetcher: the SWR key is the API path, e.g. useSWR(paths.stats, fetcher).
export const fetcher = <T>(path: string) => request<T>(path);

const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });

export const paths = {
  queue: ({ status, payerId, limit, cursor }: QueueParams = {}) => {
    const query = new URLSearchParams();
    if (status) query.set("status", status);
    if (payerId) query.set("payerId", payerId);
    if (limit) query.set("limit", String(limit));
    if (cursor) query.set("cursor", cursor);
    const qs = query.toString();
    return `/prior-auths${qs ? `?${qs}` : ""}`;
  },
  case: (id: string) => `/prior-auths/${id}`,
  stats: "/stats",
  patients: "/patients",
  payers: "/payers",
};

export const getQueue = (params: QueueParams) =>
  fetcher<QueuePage>(paths.queue(params));
export const getCase = (id: string) => fetcher<CaseDetail>(paths.case(id));
export const getStats = () => fetcher<Stats>(paths.stats);
export const getPatients = () => fetcher<Patient[]>(paths.patients);
export const getPayers = () => fetcher<Payer[]>(paths.payers);

export const createCase = (body: CreateCaseBody) =>
  post<PriorAuthCase>("/prior-auths", body);
export const transitionCase = (id: string, body: TransitionBody) =>
  post<PriorAuthCase>(`/prior-auths/${id}/transition`, body);
export const simulate = (slug: string, body: SimulateBody) =>
  post<SimulateResult>(`/simulator/payers/${slug}/send`, body);
