export enum PriorAuthStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_PAYER = 'PENDING_PAYER',
  NEEDS_INFO = 'NEEDS_INFO',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  APPEALED = 'APPEALED',
  CANCELLED = 'CANCELLED',
}

export enum ActorType {
  USER = 'USER',
  PAYER = 'PAYER',
  SYSTEM = 'SYSTEM',
}

export enum WebhookResult {
  APPLIED = 'applied',
  DUPLICATE_IGNORED = 'duplicate_ignored',
  REJECTED_INVALID_TRANSITION = 'rejected_invalid_transition',
  CASE_NOT_FOUND = 'case_not_found',
  INVALID_SIGNATURE = 'invalid_signature',
}
