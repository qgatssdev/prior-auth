import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CaseDetail } from "@/services/prior-auths/types";
import { DueLabel } from "@/common/dueLabel";
import { fullName } from "@/utils/helpers";
import { StatusBadge } from "@/common/statusBadge";

export default function CaseHeader({ data }: { data: CaseDetail }) {
  // A due date only matters while the case can still change.
  const isFinal = data.isFinal;

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm"
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
