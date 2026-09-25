"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brandMark";
import { isActive, NAV_SECTIONS } from "./navLinks";

// Phones and tablets: a compact bar instead of the sidebar.
export default function TopBar() {
  const pathname = usePathname();
  const links = NAV_SECTIONS.flatMap((section) => section.links);

  return (
    <header className="bg-background border-b lg:hidden">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <Link href="/">
          <BrandMark />
        </Link>
        <nav className="flex gap-1 text-sm">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium",
                isActive(href, pathname)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
