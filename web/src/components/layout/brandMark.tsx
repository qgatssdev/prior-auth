import { ShieldCheck } from "lucide-react";

// The PA Desk wordmark: a small sky-blue tile and the name.
export function BrandMark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
        <ShieldCheck className="size-4.5" />
      </span>
      <span className="text-lg font-semibold tracking-tight">PA Desk</span>
    </span>
  );
}
