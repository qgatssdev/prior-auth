import { FlaskConical, ListChecks } from "lucide-react";

// Shared by the desktop sidebar and the phone top bar.
export const NAV_SECTIONS = [
  { title: "Work", links: [{ href: "/", label: "Queue", icon: ListChecks }] },
  {
    title: "Demo",
    links: [{ href: "/demo", label: "Demo tools", icon: FlaskConical }],
  },
];

// The queue link also covers case pages, which you open from the queue.
export const isActive = (href: string, pathname: string) =>
  href === "/" ? !pathname.startsWith("/demo") : pathname.startsWith(href);
