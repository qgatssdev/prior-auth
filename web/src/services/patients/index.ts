import { APIResponse } from "@/common/types";
import apiHandler from "../api";
import PatientsRoute from "./patients.route";
import { PatientWithCoverages } from "./types";

export const getPatients = async () => {
  const response = await apiHandler.get<APIResponse<PatientWithCoverages[]>>(
    PatientsRoute.getPatients
  );
  return response.data.data;
};
