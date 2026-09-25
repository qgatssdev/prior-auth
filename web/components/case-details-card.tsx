import { Card, CardContent } from "@/components/ui/card";
import { codeLabel, procedureCodes } from "@/lib/codes";
import { formatDate, formatDay } from "@/lib/dates";
import type { CaseDetail } from "@/lib/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h2>
      <dl className="grid grid-cols-[9rem_1fr] gap-x-4 gap-y-1.5 text-sm">{children}</dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </>
  );
}

function Code({ code }: { code: string }) {
  return (
    <span>
      <span className="font-medium">{code}</span>
      <span className="text-muted-foreground"> · {codeLabel(code)}</span>
    </span>
  );
}

export function CaseDetailsCard({ data }: { data: CaseDetail }) {
  const { patient, payer } = data;

  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <Section title="Patient">
          <Row label="Name">
            {patient.firstName} {patient.lastName}
          </Row>
          {patient.dateOfBirth && <Row label="Date of birth">{formatDate(patient.dateOfBirth)}</Row>}
          <Row label="Member ID">{patient.memberId}</Row>
        </Section>

        <Section title="Coverage">
          <Row label="Payer">{payer.name}</Row>
          <Row label="Payer reference">
            {data.payerReference ?? <span className="text-muted-foreground">Not submitted yet</span>}
          </Row>
        </Section>

        <Section title="Codes">
          <Row label="Procedure (CPT)">
            <div className="flex flex-col">
              {procedureCodes(data.treatmentName, data.cptCode).map((code) => (
                <Code key={code} code={code} />
              ))}
            </div>
          </Row>
          <Row label="Diagnosis (ICD-10)">
            <Code code={data.icd10Code} />
          </Row>
        </Section>

        <Section title="Service date">
          <Row label="Treatment on">{formatDay(data.serviceDate)}</Row>
          <Row label="Auth due by">{formatDay(data.dueBy)}</Row>
        </Section>
      </CardContent>
    </Card>
  );
}
