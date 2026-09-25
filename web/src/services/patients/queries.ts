import { useQuery } from "@tanstack/react-query";
import { getPatients } from ".";

export const usePatients = () => {
  return useQuery({ queryKey: ["patients"], queryFn: getPatients });
};
