import { PriorAuthStatus } from 'src/libs/common/constants';

const {
  SUBMITTED,
  PENDING_PAYER,
  NEEDS_INFO,
  APPROVED,
  DENIED,
  APPEALED,
  CANCELLED,
} = PriorAuthStatus;

// The single source of truth for the status lifecycle.
export const ALLOWED: Record<PriorAuthStatus, PriorAuthStatus[]> = {
  DRAFT: [SUBMITTED, CANCELLED],
  SUBMITTED: [PENDING_PAYER, NEEDS_INFO, APPROVED, DENIED],
  PENDING_PAYER: [NEEDS_INFO, APPROVED, DENIED],
  NEEDS_INFO: [SUBMITTED],
  DENIED: [APPEALED],
  APPEALED: [APPROVED, DENIED],
  APPROVED: [],
  CANCELLED: [],
};

export const canTransition = (from: PriorAuthStatus, to: PriorAuthStatus) =>
  ALLOWED[from].includes(to);

export const FINAL = [APPROVED, CANCELLED];

// A note is required when resubmitting from NEEDS_INFO and when appealing.
export const noteRequired = (from: PriorAuthStatus, to: PriorAuthStatus) =>
  (from === NEEDS_INFO && to === SUBMITTED) || to === APPEALED;
