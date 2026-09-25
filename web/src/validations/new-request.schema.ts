import * as Yup from "yup";
import { dayFromToday } from "@/utils/dates";

// Same rule as the API: the service must be at least this many days away.
export const MIN_DAYS_AHEAD = 4;

export const newRequestSchema = Yup.object({
  patientId: Yup.string().required("Choose a patient"),
  coverageId: Yup.string().required("Choose which insurance to bill"),
  treatment: Yup.string().required("Choose a treatment"),
  serviceDate: Yup.string()
    .required("Choose a service date")
    // "YYYY-MM-DD" strings sort the same way as the dates they describe.
    .test(
      "min-days-ahead",
      `Must be at least ${MIN_DAYS_AHEAD} days from today`,
      (value) => value >= dayFromToday(MIN_DAYS_AHEAD)
    ),
});

export type NewRequestValues = Yup.InferType<typeof newRequestSchema>;
