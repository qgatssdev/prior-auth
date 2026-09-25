import { Building2, Settings, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatExact } from "@/lib/dates";
import { STATUS } from "@/lib/status";
import type { ActorType, PriorAuthEvent } from "@/lib/types";

const ACTOR_ICON: Record<ActorType, typeof User> = {
  USER: User,
  PAYER: Building2,
  SYSTEM: Settings,
};

export function Timeline({ events }: { events: PriorAuthEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col">
          {events.map((event) => {
            const Icon = ACTOR_ICON[event.actorType];
            return (
              <li key={event.id} className="flex gap-3 border-b py-3 last:border-0">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="size-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <div>
                    <span className="font-medium">{event.actorName}</span>
                    <span className="text-muted-foreground"> · </span>
                    {event.fromStatus
                      ? `${STATUS[event.fromStatus].label} to ${STATUS[event.toStatus].label}`
                      : STATUS[event.toStatus].label}
                  </div>
                  {event.note && <p className="text-muted-foreground">{event.note}</p>}
                  <time dateTime={event.createdAt} className="text-xs text-muted-foreground sm:hidden">
                    {formatExact(event.createdAt)}
                  </time>
                </div>
                <time
                  dateTime={event.createdAt}
                  className="hidden text-sm whitespace-nowrap text-muted-foreground sm:block"
                >
                  {formatExact(event.createdAt)}
                </time>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
