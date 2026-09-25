"use client";

import Link from "next/link";
import { use } from "react";
import useSWR from "swr";
import { ActionsCard } from "@/components/actions-card";
import { CaseDetailsCard } from "@/components/case-details-card";
import { CaseHeader } from "@/components/case-header";
import { Timeline } from "@/components/timeline";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher, paths } from "@/lib/api";
import type { CaseDetail } from "@/lib/types";

export default function CasePage({ params }: PageProps<"/cases/[id]">) {
  const { id } = use(params);
  const { data, error, mutate } = useSWR<CaseDetail>(paths.case(id), fetcher, {
    refreshInterval: 5000,
  });

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error.message}
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
          <ActionsCard data={data} onChanged={() => mutate()} />
        </div>
        <div className="lg:order-1 lg:col-span-2">
          <CaseDetailsCard data={data} />
        </div>
      </div>
      <Timeline events={data.events} />
    </div>
  );
}
