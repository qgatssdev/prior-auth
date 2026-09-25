import { useQuery } from "@tanstack/react-query";
import { getPayers } from ".";

export const usePayers = () => {
  return useQuery({ queryKey: ["payers"], queryFn: getPayers });
};
