import { daysFromToday, formatDay } from "@/lib/dates";
import { cn } from "@/lib/utils";

// "Thu 8 Oct · in 2 days": red within 48 hours or overdue, amber within 5 days.
export function DueLabel({ dueBy }: { dueBy: string }) {
  const days = daysFromToday(dueBy);

  let when: string;
  if (days < 0) when = "Overdue";
  else if (days === 0) when = "today";
  else if (days === 1) when = "tomorrow";
  else when = `in ${days} days`;

  return (
    <span
      className={cn(
        "whitespace-nowrap",
        days <= 2 && "font-medium text-red-600",
        days > 2 && days <= 5 && "text-amber-600",
      )}
    >
      {formatDay(dueBy)} · {when}
    </span>
  );
}
