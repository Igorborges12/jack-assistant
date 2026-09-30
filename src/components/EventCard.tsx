import type { CalendarEvent } from "@/types";

export function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <div className="flex gap-3">
      <span className="w-12 shrink-0 text-[11px] font-semibold text-brand">{event.time}</span>
      <div className="border-l-2 border-brand/30 pl-3">
        <p className="text-sm font-medium">{event.title}</p>
        <p className="text-[11px] text-muted-foreground">
          {event.kind}
          {event.location ? ` · ${event.location}` : ""} · {event.date}
        </p>
      </div>
    </div>
  );
}
