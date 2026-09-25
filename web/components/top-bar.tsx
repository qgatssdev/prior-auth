"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Queue" },
  { href: "/demo", label: "Demo tools" },
];

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-semibold tracking-tight">
          PA Desk
        </Link>
        <nav className="flex gap-1 text-sm">
          {LINKS.map(({ href, label }) => {
            // The queue link also covers case pages, which you open from the queue.
            const active =
              href === "/" ? !pathname.startsWith("/demo") : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground",
                  active && "bg-muted font-medium text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
