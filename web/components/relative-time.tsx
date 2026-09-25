import { formatExact, formatRelative } from "@/lib/dates";

// "2h ago", with the exact time on hover.
export function RelativeTime({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} title={formatExact(iso)} className="whitespace-nowrap">
      {formatRelative(iso)}
    </time>
  );
}
