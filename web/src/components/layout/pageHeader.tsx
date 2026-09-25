import type { LucideIcon } from "lucide-react";

// Page title with its icon, as on every top-level page.
export default function PageHeader({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="text-muted-foreground size-5" />
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
    </div>
  );
}
