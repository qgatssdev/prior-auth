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

// What the queue shows by default: every case someone may still need to act on.
export const OPEN = [
  PriorAuthStatus.DRAFT,
  SUBMITTED,
  PENDING_PAYER,
  NEEDS_INFO,
  APPEALED,
];

// Named groups the queue can filter by, besides a single status.
export const STATUS_GROUPS = {
  OPEN,
  // Waiting on the insurer: matches the "Pending payer" stat.
  PENDING: [SUBMITTED, PENDING_PAYER],
  ALL: Object.values(PriorAuthStatus),
};
export type StatusGroup = keyof typeof STATUS_GROUPS;
