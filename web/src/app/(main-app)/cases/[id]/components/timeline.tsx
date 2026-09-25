import { Building2, Settings, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatExact } from "@/utils/dates";
import { STATUS } from "@/utils/status";
import type { ActorType, PriorAuthEvent } from "@/services/prior-auths/types";

const ACTOR_ICON: Record<ActorType, typeof User> = {
  USER: User,
  PAYER: Building2,
  SYSTEM: Settings,
};

export default function Timeline({ events }: { events: PriorAuthEvent[] }) {
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
              <li
                key={event.id}
                className="flex gap-3 border-b py-3 last:border-0"
              >
                <span className="bg-muted mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
                  <Icon className="text-muted-foreground size-4" />
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <div>
                    <span className="font-medium">{event.actorName}</span>
                    <span className="text-muted-foreground"> · </span>
                    {event.fromStatus
                      ? `${STATUS[event.fromStatus].label} to ${STATUS[event.toStatus].label}`
                      : STATUS[event.toStatus].label}
                  </div>
                  {event.note && (
                    <p className="text-muted-foreground">{event.note}</p>
                  )}
                  <time
                    dateTime={event.createdAt}
                    className="text-muted-foreground text-xs sm:hidden"
                  >
                    {formatExact(event.createdAt)}
                  </time>
                </div>
                <time
                  dateTime={event.createdAt}
                  className="text-muted-foreground hidden text-sm whitespace-nowrap sm:block"
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
