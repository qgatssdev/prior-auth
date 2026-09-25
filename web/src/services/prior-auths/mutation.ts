import { useMutation, useQueryClient } from "@tanstack/react-query";
import { statsKey } from "../stats/queries";
import { createCase, transitionCase } from ".";
import { caseKey, queueKey } from "./queries";
import { PriorAuthCase, TransitionPayload } from "./types";

type OnSuccess = (priorAuth: PriorAuthCase) => void;
type OnError = (error: Error) => void;

export const useCreateCase = (onSuccess: OnSuccess, onError: OnError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCase,
    onSuccess: (created) => {
      // Refresh now instead of waiting for the next poll.
      void queryClient.invalidateQueries({ queryKey: queueKey });
      void queryClient.invalidateQueries({ queryKey: statsKey });
      onSuccess(created);
    },
    onError,
  });
};

// The id travels with each call (not the hook), because a case created in the
// same form has no id until it is saved.
export const useTransitionCase = (onSuccess: OnSuccess, onError: OnError) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TransitionPayload }) =>
      transitionCase(id, payload),
    onSuccess: (moved, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queueKey });
      void queryClient.invalidateQueries({ queryKey: statsKey });
      void queryClient.invalidateQueries({ queryKey: caseKey(id) });
      onSuccess(moved);
    },
    onError,
  });
};
