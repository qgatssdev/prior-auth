"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";
import { isActive, NAV_SECTIONS } from "./nav-links";

// Desktop navigation. On smaller screens the TopBar takes its place.
export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
      <Link href="/" className="px-6 pt-6 pb-8">
        <BrandMark />
      </Link>

      <nav className="flex flex-1 flex-col gap-6 px-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-1">
            <span className="px-3 pb-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {section.title}
            </span>
            {section.links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors",
                  isActive(href, pathname)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-[18px]" />
                {label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* No login in this project: every action is taken as the demo specialist. */}
      <div className="flex items-center gap-3 border-t px-6 py-4">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          DS
        </span>
        <div className="text-sm leading-tight">
          <div className="font-medium">Demo specialist</div>
          <div className="text-xs text-muted-foreground">Billing team</div>
        </div>
      </div>
    </aside>
  );
}
