"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { createCase, fetcher, paths, transitionCase } from "@/lib/api";
import { SearchableSelect } from "./searchable-select";
import { TREATMENTS } from "@/lib/codes";
import { dayFromToday } from "@/lib/dates";
import { fullName } from "@/lib/utils";
import type { Coverage, Patient, PriorAuthCase } from "@/lib/types";

// Same rule as the API: the service must be at least 4 days away.
const MIN_DAYS_AHEAD = 4;

const EMPTY_FORM = { patientId: "", coverageId: "", treatment: "", serviceDate: "" };
type Form = typeof EMPTY_FORM;
type Errors = Partial<Record<keyof Form, string>>;

function validate(form: Form): Errors {
  const errors: Errors = {};
  if (!form.patientId) errors.patientId = "Choose a patient";
  if (!form.coverageId) errors.coverageId = "Choose which insurance to bill";
  if (!form.treatment) errors.treatment = "Choose a treatment";
  if (!form.serviceDate) errors.serviceDate = "Choose a service date";
  // "YYYY-MM-DD" strings sort the same way as the dates they describe.
  else if (form.serviceDate < dayFromToday(MIN_DAYS_AHEAD)) {
    errors.serviceDate = `Must be at least ${MIN_DAYS_AHEAD} days from today`;
  }
  return errors;
}

const coverageLabel = (c: Coverage) =>
  `${c.payer?.name} · ${c.priority === "PRIMARY" ? "Primary" : "Secondary"} · ${c.memberId}`;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
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
  onChanged: () => void;
}

export function NewRequestSheet({ open, onOpenChange, onChanged }: NewRequestSheetProps) {
  const router = useRouter();
  const { data: patients } = useSWR<Patient[]>(paths.patients, fetcher);

  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  // Set after saving: the sheet then offers "Submit to payer now" and "Open case".
  const [created, setCreated] = useState<PriorAuthCase | null>(null);

  const treatment = TREATMENTS.find((t) => t.name === form.treatment);
  const patient = patients?.find((p) => p.id === form.patientId);
  const createdPatient = patients?.find((p) => p.id === created?.patientId);

  function update(changes: Partial<Form>) {
    setForm((current) => ({ ...current, ...changes }));
    // Clear the errors of the fields just changed.
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(changes) as (keyof Form)[]) delete next[key];
      return next;
    });
  }

  function reset(nextOpen: boolean) {
    if (!nextOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
      setCreated(null);
    }
    onOpenChange(nextOpen);
  }

  async function save() {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0 || !treatment) return;

    setBusy(true);
    try {
      const draft = await createCase({
        patientId: form.patientId,
        coverageId: form.coverageId,
        treatmentName: treatment.name,
        cptCode: treatment.cptCode,
        icd10Code: treatment.icd10Code,
        serviceDate: form.serviceDate,
      });
      toast.success("Draft created");
      setCreated(draft);
      onChanged();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function submitNow() {
    if (!created) return;
    setBusy(true);
    try {
      await transitionCase(created.id, { toStatus: "SUBMITTED" });
      toast.success("Moved to Submitted");
      onChanged();
      reset(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={reset}>
      <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{created ? "Draft created" : "New request"}</SheetTitle>
          <SheetDescription>
            {created
              ? `${createdPatient ? fullName(createdPatient) : ""} · ${created.treatmentName}`
              : "Creates a draft prior authorization request."}
          </SheetDescription>
        </SheetHeader>

        {created ? (
          <SheetFooter className="mt-0 flex-col gap-2">
            <Button className="h-10" onClick={submitNow} disabled={busy}>
              {busy ? "Submitting…" : "Submit to payer now"}
            </Button>
            <Button className="h-10" variant="outline" onClick={() => router.push(`/cases/${created.id}`)}>
              Open case
            </Button>
          </SheetFooter>
        ) : (
          <>
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
              <Field label="Patient" error={errors.patientId}>
                <SearchableSelect
                  value={form.patientId}
                  // Pre-select the patient's primary coverage; a secondary one can be chosen instead.
                  onChange={(patientId) =>
                    update({
                      patientId,
                      coverageId:
                        patients
                          ?.find((p) => p.id === patientId)
                          ?.coverages?.find((c) => c.priority === "PRIMARY")?.id ?? "",
                    })
                  }
                  options={(patients ?? []).map((patient) => ({
                    value: patient.id,
                    searchText: fullName(patient),
                    label: (
                      <>
                        {fullName(patient)}
                        {(patient.coverages?.length ?? 0) > 1 && (
                          <span className="text-muted-foreground"> · {patient.coverages?.length} plans</span>
                        )}
                      </>
                    ),
                  }))}
                  invalid={!!errors.patientId}
                  placeholder="Choose a patient"
                  searchPlaceholder="Search patients…"
                  emptyText="No patient matches."
                />
              </Field>

              {/* Only the chosen patient's own plans, so the payer and member ID always match. */}
              <Field label="Insurance to bill" error={errors.coverageId}>
                <Select
                  value={form.coverageId}
                  onValueChange={(coverageId) => update({ coverageId })}
                  disabled={!patient}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!errors.coverageId}>
                    <SelectValue placeholder={patient ? "Choose a coverage" : "Choose a patient first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {patient?.coverages?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {coverageLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Treatment" error={errors.treatment}>
                <Select value={form.treatment} onValueChange={(name) => update({ treatment: name })}>
                  <SelectTrigger className="w-full" aria-invalid={!!errors.treatment}>
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
                  <span className="text-xs text-muted-foreground">
                    CPT {[treatment.cptCode, ...treatment.extraCodes].join(" + ")} · ICD-10{" "}
                    {treatment.icd10Code}
                  </span>
                )}
              </Field>

              <Field label="Service date" error={errors.serviceDate}>
                <Input
                  type="date"
                  min={dayFromToday(MIN_DAYS_AHEAD)}
                  value={form.serviceDate}
                  onChange={(e) => update({ serviceDate: e.target.value })}
                  aria-invalid={!!errors.serviceDate}
                />
              </Field>
            </div>

            <SheetFooter>
              {/* Full-width footer actions: 40px tall, easier to hit than the default 32px. */}
              <Button className="h-10" onClick={save} disabled={busy}>
                {busy ? "Saving…" : "Save draft"}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
