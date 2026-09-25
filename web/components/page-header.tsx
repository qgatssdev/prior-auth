import type { LucideIcon } from "lucide-react";

// Page title with its icon, as on every top-level page.
export function PageHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-5 text-muted-foreground" />
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
    </div>
  );
}
