import { Badge } from "@/components/ui/badge";
import { STATUS } from "@/lib/status";
import type { PriorAuthStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  large = false,
}: {
  status: PriorAuthStatus;
  large?: boolean;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(STATUS[status].badgeClass, large && "h-7 px-3 text-sm")}
    >
      {STATUS[status].label}
    </Badge>
  );
}
