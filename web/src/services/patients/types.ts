import { Payer } from "../payers/types";

export type CoveragePriority = "PRIMARY" | "SECONDARY";

// The coverage a case bills, as the queue and case detail return it.
export interface CoverageSummary {
  id: string;
  memberId: string;
  priority: CoveragePriority;
}

// One insurance plan a patient holds. The member ID belongs to the plan.
export interface Coverage extends CoverageSummary {
  payerId: string;
  payer: Pick<Payer, "id" | "name">;
}

// GET /patients: each patient with their active plans, primary first.
export interface PatientWithCoverages {
  id: string;
  firstName: string;
  lastName: string;
  coverages: Coverage[];
}
