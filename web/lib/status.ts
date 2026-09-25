import type { PriorAuthStatus } from "./types";

interface StatusMeta {
  label: string;
  badgeClass: string;
  // Button text when this status is the target of an action.
  actionLabel: string | null;
}

export const STATUS: Record<PriorAuthStatus, StatusMeta> = {
  DRAFT: {
    label: "Draft",
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
    actionLabel: null,
  },
  SUBMITTED: {
    label: "Submitted",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    actionLabel: "Submit to payer",
  },
  PENDING_PAYER: {
    label: "Pending payer",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    actionLabel: "Mark pending",
  },
  NEEDS_INFO: {
    label: "Needs info",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
    actionLabel: "Mark needs info",
  },
  APPROVED: {
    label: "Approved",
    badgeClass: "bg-green-100 text-green-800 border-green-200",
    actionLabel: "Mark approved",
  },
  DENIED: {
    label: "Denied",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    actionLabel: "Mark denied",
  },
  APPEALED: {
    label: "Appealed",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    actionLabel: "Start appeal",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "bg-muted text-muted-foreground border-border",
    actionLabel: "Cancel request",
  },
};

export function actionLabel(from: PriorAuthStatus, to: PriorAuthStatus) {
  if (from === "NEEDS_INFO" && to === "SUBMITTED") {
    return "Resubmit with information";
  }
  return STATUS[to].actionLabel ?? STATUS[to].label;
}

// Mirrors noteRequired in api/src/modules/prior-auths/transitions.ts, so the UI
// can ask for the note up front. The API still enforces it.
export const noteRequired = (from: PriorAuthStatus, to: PriorAuthStatus) =>
  (from === "NEEDS_INFO" && to === "SUBMITTED") || to === "APPEALED";
