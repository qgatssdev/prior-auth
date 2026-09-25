import { Payer } from "../payers/types";
import { CoverageSummary } from "../patients/types";

export type PriorAuthStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING_PAYER"
  | "NEEDS_INFO"
  | "APPROVED"
  | "DENIED"
  | "APPEALED"
  | "CANCELLED";

// The queue filters by a named group or a single status.
export type StatusGroup = "OPEN" | "PENDING" | "ALL";

export type ActorType = "USER" | "PAYER" | "SYSTEM";

export interface PatientSummary {
  id: string;
  firstName: string;
  lastName: string;
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
  patient: PatientSummary;
  coverage: CoverageSummary;
  payer: Payer;
}

export interface QueuePage {
  items: PriorAuthCase[];
  nextCursor: string | null;
}

// A type, not an interface, so it fits buildQueryParams' index signature.
export type QueueParams = {
  status: StatusGroup | PriorAuthStatus;
  payerId?: string;
  limit?: number;
  cursor?: string;
};

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
  patient: PatientSummary & { dateOfBirth: string };
  events: PriorAuthEvent[];
  // Moves staff can make. Insurer decisions (approve, deny…) never appear here.
  allowedActions: PriorAuthStatus[];
  // What the insurer could send next (used by the demo simulator).
  insurerActions: PriorAuthStatus[];
  isFinal: boolean;
}

export interface CreateCasePayload {
  patientId: string;
  coverageId: string;
  treatmentName: string;
  cptCode: string;
  icd10Code: string;
  serviceDate: string;
}

export interface TransitionPayload {
  toStatus: PriorAuthStatus;
  note?: string;
}
