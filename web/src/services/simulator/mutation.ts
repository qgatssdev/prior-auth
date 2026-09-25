import { useMutation, useQueryClient } from "@tanstack/react-query";
import { caseKey, queueKey } from "../prior-auths/queries";
import { statsKey } from "../stats/queries";
import { simulate } from ".";
import { SimulatePayload, SimulateResult } from "./types";

/**
 * Plays the insurer: our API signs the update and sends it to its own webhook.
 * The case it touched, the queue and the stats refresh straight away.
 */
export const useSimulate = (
  onSuccess: (result: SimulateResult, payload: SimulatePayload) => void,
  onError: (error: Error) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      slug,
      payload,
    }: {
      slug: string;
      caseId: string;
      payload: SimulatePayload;
    }) => simulate(slug, payload),
    onSuccess: (result, { caseId, payload }) => {
      void queryClient.invalidateQueries({ queryKey: queueKey });
      void queryClient.invalidateQueries({ queryKey: statsKey });
      void queryClient.invalidateQueries({ queryKey: caseKey(caseId) });
      onSuccess(result, payload);
    },
    onError,
  });
};
