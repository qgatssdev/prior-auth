"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDay, parseDay, toDayString } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string; // "YYYY-MM-DD", or "" when empty
  onChange: (value: string) => void;
  minDate?: string; // earlier days are shown but can't be picked
  placeholder: string;
  invalid?: boolean;
}

// A calendar in a popover, styled like the app's other fields (the browser's own
// date picker looks different in every browser).
export function DatePicker({ value, onChange, minDate, placeholder, invalid }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseDay(value) : undefined;
  const min = minDate ? parseDay(minDate) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          // data-invalid, not aria-invalid: that ARIA attribute isn't valid on a button.
          data-invalid={invalid || undefined}
          className={cn(
            "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-background py-2 pr-2 pl-2.5 text-left text-sm transition-colors outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20",
          )}
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {/* "Thu 8 Oct 2026": the weekday matters when booking a treatment. */}
            {value ? `${formatDay(value)} ${parseDay(value).getFullYear()}` : placeholder}
          </span>
          <CalendarIcon className="size-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(toDayString(date));
            setOpen(false);
          }}
          disabled={min ? { before: min } : undefined}
          // Open on the chosen month, or the first month you can pick from.
          defaultMonth={selected ?? min}
          startMonth={min}
          weekStartsOn={1}
          // 36px day cells (the default is 28px): easier to read and to tap.
          className="[--cell-size:--spacing(9)]"
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
