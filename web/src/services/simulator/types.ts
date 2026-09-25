export type PayerStatusWord = "pending" | "needs_info" | "approved" | "denied";
export type SimulatorMode = "normal" | "duplicate" | "bad_signature";

export type WebhookResult =
  | "applied"
  | "duplicate_ignored"
  | "rejected_invalid_transition"
  | "case_not_found"
  | "invalid_signature";

export interface SimulatePayload {
  payerReference: string;
  status: PayerStatusWord;
  note?: string;
  mode: SimulatorMode;
}

// What our webhook answered: a success envelope, or an error with a message.
export interface SimulateResult {
  httpStatus: number;
  body: { data?: { result: WebhookResult }; message?: string | string[] };
}
