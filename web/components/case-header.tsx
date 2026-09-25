import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CaseDetail } from "@/lib/types";
import { DueLabel } from "./due-label";
import { fullName } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

export function CaseHeader({ data }: { data: CaseDetail }) {
  // A due date only matters while the case can still change.
  const isFinal = data.isFinal;

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to queue
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {fullName(data.patient)}
          </h1>
          <p className="text-muted-foreground">{data.treatmentName}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <StatusBadge status={data.status} large />
          {!isFinal && (
            <span className="text-sm">
              Due <DueLabel dueBy={data.dueBy} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
