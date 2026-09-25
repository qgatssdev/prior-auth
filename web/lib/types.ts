// Mirrors the API responses (the `data` inside the API's { success, message, data } envelope).

export type PriorAuthStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING_PAYER"
  | "NEEDS_INFO"
  | "APPROVED"
  | "DENIED"
  | "APPEALED"
  | "CANCELLED";

export type ActorType = "USER" | "PAYER" | "SYSTEM";

export type WebhookResult =
  | "applied"
  | "duplicate_ignored"
  | "rejected_invalid_transition"
  | "case_not_found"
  | "invalid_signature";

export interface Payer {
  id: string;
  name: string;
  slug: string;
  avgTurnaroundDays?: number;
}

export type CoveragePriority = "PRIMARY" | "SECONDARY";

// One insurance plan a patient holds. The member ID belongs to the plan.
export interface Coverage {
  id: string;
  memberId: string;
  priority: CoveragePriority;
  payerId?: string;
  payer?: Pick<Payer, "id" | "name">;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  coverages?: Coverage[];
}

export interface PriorAuthCase {
  id: string;
  status: PriorAuthStatus;
  treatmentName: string;
  cptCode: string;
  icd10Code: string;
  serviceDate: string;
  dueBy: string;
  payerReference: string | null;
  createdAt: string;
  updatedAt: string;
  patientId: string;
  coverageId: string;
  payerId: string;
  patient: Patient;
  coverage: Coverage;
  payer: Payer;
}

export interface QueuePage {
  items: PriorAuthCase[];
  nextCursor: string | null;
}

// The API filters by a named group or a single status.
export type StatusGroup = "OPEN" | "PENDING" | "ALL";

export interface QueueParams {
  status?: StatusGroup | PriorAuthStatus;
  payerId?: string;
  limit?: number;
  cursor?: string;
}

export interface PriorAuthEvent {
  id: string;
  fromStatus: PriorAuthStatus | null;
  toStatus: PriorAuthStatus;
  actorType: ActorType;
  actorName: string;
  note: string | null;
  createdAt: string;
}

export interface CaseDetail extends PriorAuthCase {
  events: PriorAuthEvent[];
  // Moves staff can make. Insurer decisions (approve, deny…) never appear here.
  allowedActions: PriorAuthStatus[];
  // What the insurer could send next (used by the demo simulator).
  insurerActions: PriorAuthStatus[];
  isFinal: boolean;
}

export interface Stats {
  needsInfo: number;
  pendingPayer: number;
  dueSoon: number;
  deniedAppealable: number;
}

export interface CreateCaseBody {
  patientId: string;
  coverageId: string;
  treatmentName: string;
  cptCode: string;
  icd10Code: string;
  serviceDate: string;
}

export interface TransitionBody {
  toStatus: PriorAuthStatus;
  note?: string;
}

export type PayerStatusWord = "pending" | "needs_info" | "approved" | "denied";
export type SimulatorMode = "normal" | "duplicate" | "bad_signature";

export interface SimulateBody {
  payerReference: string;
  status: PayerStatusWord;
  note?: string;
  mode: SimulatorMode;
}

export interface SimulateResult {
  httpStatus: number;
  // The webhook's own response: a success envelope, or an error with a message.
  body: { data?: { result: WebhookResult }; message?: string | string[] };
}
