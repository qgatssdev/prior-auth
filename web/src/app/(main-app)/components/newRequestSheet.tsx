"use client";

import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { DatePicker } from "@/common/datePicker";
import { SearchableSelect } from "@/common/searchableSelect";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePatients } from "@/services/patients/queries";
import type { Coverage } from "@/services/patients/types";
import {
  useCreateCase,
  useTransitionCase,
} from "@/services/prior-auths/mutation";
import type { PriorAuthCase } from "@/services/prior-auths/types";
import { TREATMENTS } from "@/utils/codes";
import { dayFromToday } from "@/utils/dates";
import { fullName, getApiErrorMessage } from "@/utils/helpers";
import {
  MIN_DAYS_AHEAD,
  newRequestSchema,
  type NewRequestValues,
} from "@/validations/new-request.schema";

const initialValues: NewRequestValues = {
  patientId: "",
  coverageId: "",
  treatment: "",
  serviceDate: "",
};

const coverageLabel = (coverage: Coverage) =>
  `${coverage.payer.name} · ${coverage.priority === "PRIMARY" ? "Primary" : "Secondary"} · ${coverage.memberId}`;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

interface NewRequestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewRequestSheet({
  open,
  onOpenChange,
}: NewRequestSheetProps) {
  const router = useRouter();
  const { data: patients = [] } = usePatients();
  // Set after saving: the sheet then offers "Submit to payer now" and "Open case".
  const [created, setCreated] = useState<PriorAuthCase | null>(null);
  const createdPatient = patients.find((p) => p.id === created?.patientId);

  const close = (nextOpen: boolean) => {
    // The form lives inside SheetContent, which unmounts on close, so Formik
    // starts empty next time. Only the "created" step needs clearing here.
    if (!nextOpen) setCreated(null);
    onOpenChange(nextOpen);
  };

  const onError = (error: Error) => toast.error(getApiErrorMessage(error));

  const { mutate: createCase, isPending: isCreating } = useCreateCase(
    (draft) => {
      toast.success("Draft created");
      setCreated(draft);
    },
    onError
  );

  const { mutate: transitionCase, isPending: isSubmitting } = useTransitionCase(
    () => {
      toast.success("Moved to Submitted");
      close(false);
    },
    onError
  );

  const onSubmit = (values: NewRequestValues) => {
    const treatment = TREATMENTS.find((t) => t.name === values.treatment)!;
    createCase({
      patientId: values.patientId,
      coverageId: values.coverageId,
      treatmentName: treatment.name,
      cptCode: treatment.cptCode,
      icd10Code: treatment.icd10Code,
      serviceDate: values.serviceDate,
    });
  };

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{created ? "Draft created" : "New request"}</SheetTitle>
          <SheetDescription>
            {created && createdPatient
              ? `${fullName(createdPatient)} · ${created.treatmentName}`
              : "Creates a draft prior authorization request."}
          </SheetDescription>
        </SheetHeader>

        {created ? (
          <SheetFooter className="mt-0 flex-col gap-2">
            <Button
              className="h-10"
              onClick={() =>
                transitionCase({
                  id: created.id,
                  payload: { toStatus: "SUBMITTED" },
                })
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting…" : "Submit to payer now"}
            </Button>
            <Button
              className="h-10"
              variant="outline"
              onClick={() => router.push(`/cases/${created.id}`)}
            >
              Open case
            </Button>
          </SheetFooter>
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={newRequestSchema}
            onSubmit={onSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleSubmit,
              setFieldValue,
              setValues,
            }) => {
              const patient = patients.find((p) => p.id === values.patientId);
              const treatment = TREATMENTS.find(
                (t) => t.name === values.treatment
              );
              const errorOf = (field: keyof NewRequestValues) =>
                touched[field] ? errors[field] : undefined;

              return (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-1 flex-col overflow-hidden"
                >
                  <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
                    <Field label="Patient" error={errorOf("patientId")}>
                      <SearchableSelect
                        value={values.patientId}
                        // Pre-select the patient's primary coverage; a secondary one can be chosen instead.
                        onChange={(patientId) => {
                          const primary = patients
                            .find((p) => p.id === patientId)
                            ?.coverages.find((c) => c.priority === "PRIMARY");
                          // One update, so Yup validates once with both new values. Two
                          // setFieldValue calls validate twice, and the first (coverage
                          // still empty) can finish last and leave a stale error.
                          void setValues({
                            ...values,
                            patientId,
                            coverageId: primary?.id ?? "",
                          });
                        }}
                        options={patients.map((p) => ({
                          value: p.id,
                          searchText: fullName(p),
                          label: (
                            <>
                              {fullName(p)}
                              {p.coverages.length > 1 && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  · {p.coverages.length} plans
                                </span>
                              )}
                            </>
                          ),
                        }))}
                        invalid={!!errorOf("patientId")}
                        placeholder="Choose a patient"
                        searchPlaceholder="Search patients…"
                        emptyText="No patient matches."
                      />
                    </Field>

                    {/* Only the chosen patient's own plans, so the payer and member ID always match. */}
                    <Field
                      label="Insurance to bill"
                      error={errorOf("coverageId")}
                    >
                      <Select
                        value={values.coverageId}
                        // Inside a <form>, Radix renders a hidden native select. When the
                        // patient changes, it sees the new plan id before that patient's
                        // options register and reports "" — which would wipe the
                        // pre-selected primary plan. A real choice is never "".
                        onValueChange={(coverageId) => {
                          if (coverageId)
                            void setFieldValue("coverageId", coverageId);
                        }}
                        disabled={!patient}
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={!!errorOf("coverageId")}
                        >
                          <SelectValue
                            placeholder={
                              patient
                                ? "Choose a coverage"
                                : "Choose a patient first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {patient?.coverages.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {coverageLabel(c)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Treatment" error={errorOf("treatment")}>
                      <Select
                        value={values.treatment}
                        onValueChange={(name) =>
                          void setFieldValue("treatment", name)
                        }
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={!!errorOf("treatment")}
                        >
                          <SelectValue placeholder="Choose a treatment" />
                        </SelectTrigger>
                        <SelectContent>
                          {TREATMENTS.map((t) => (
                            <SelectItem key={t.name} value={t.name}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {treatment && (
                        <span className="text-muted-foreground text-xs">
                          CPT{" "}
                          {[treatment.cptCode, ...treatment.extraCodes].join(
                            " + "
                          )}{" "}
                          · ICD-10 {treatment.icd10Code}
                        </span>
                      )}
                    </Field>

                    <Field label="Service date" error={errorOf("serviceDate")}>
                      <DatePicker
                        value={values.serviceDate}
                        onChange={(serviceDate) =>
                          void setFieldValue("serviceDate", serviceDate)
                        }
                        minDate={dayFromToday(MIN_DAYS_AHEAD)}
                        placeholder="Choose a date"
                        invalid={!!errorOf("serviceDate")}
                      />
                    </Field>
                  </div>

                  <SheetFooter>
                    {/* Full-width footer actions: 40px tall, easier to hit than the default 32px. */}
                    <Button
                      type="submit"
                      className="h-10"
                      disabled={isCreating}
                    >
                      {isCreating ? "Saving…" : "Save draft"}
                    </Button>
                  </SheetFooter>
                </form>
              );
            }}
          </Formik>
        )}
      </SheetContent>
    </Sheet>
  );
}
