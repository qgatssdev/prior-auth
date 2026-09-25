"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useCase } from "@/services/prior-auths/queries";
import { getApiErrorMessage } from "@/utils/helpers";
import ActionsCard from "./actionsCard";
import CaseDetailsCard from "./caseDetailsCard";
import CaseHeader from "./caseHeader";
import Timeline from "./timeline";

export default function CaseView({ id }: { id: string }) {
  const { data, error } = useCase(id);

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {getApiErrorMessage(error)}
        </p>
        <Link href="/" className="text-sm underline">
          Back to queue
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-16 w-1/2" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CaseHeader data={data} />
      {/* On phones the actions come first: they are why you opened the case. */}
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="lg:order-2">
          <ActionsCard data={data} />
        </div>
        <div className="lg:order-1 lg:col-span-2">
          <CaseDetailsCard data={data} />
        </div>
      </div>
      <Timeline events={data.events} />
    </div>
  );
}
