import { Card, CardContent } from "@/components/ui/card";
import { codeLabel, procedureCodes } from "@/utils/codes";
import { formatDate, formatDay } from "@/utils/dates";
import type { CaseDetail } from "@/services/prior-auths/types";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {title}
      </h2>
      <dl className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-4">
        {children}
      </dl>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
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

export default function CaseDetailsCard({ data }: { data: CaseDetail }) {
  const { patient, payer } = data;

  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <Section title="Patient">
          <Row label="Name">
            {patient.firstName} {patient.lastName}
          </Row>
          {patient.dateOfBirth && (
            <Row label="Date of birth">{formatDate(patient.dateOfBirth)}</Row>
          )}
        </Section>

        <Section title="Coverage">
          <Row label="Payer">
            {payer.name}
            <span className="text-muted-foreground">
              {" "}
              · {data.coverage.priority === "PRIMARY"
                ? "Primary"
                : "Secondary"}{" "}
              coverage
            </span>
          </Row>
          <Row label="Member ID">{data.coverage.memberId}</Row>
          <Row label="Payer reference">
            {data.payerReference ?? (
              <span className="text-muted-foreground">Not submitted yet</span>
            )}
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
