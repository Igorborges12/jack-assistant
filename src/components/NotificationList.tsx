import { Link } from "@tanstack/react-router";
import { AGENT_GLYPH } from "@/lib/agents";
import { formatTime } from "@/lib/format";
import { EmptyState } from "@/components/common/EmptyState";
import { notificationsService } from "@/services";
import type { AppNotification } from "@/types";

export function NotificationList({ items }: { items: AppNotification[] }) {
  if (items.length === 0) {
    return <EmptyState title="Sem notificações" description="Você está em dia." glyph="✓" />;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Link
          key={item.id}
          to={item.to ?? "/dashboard"}
          onClick={() => notificationsService.markRead(item.id)}
          className="glass-soft flex gap-3 rounded-xl px-3 py-2.5 transition hover:bg-card/80"
        >
          <span aria-hidden className="mt-0.5 text-sm text-brand">
            {AGENT_GLYPH[item.agent]}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-[13px] font-semibold">{item.title}</p>
              {!item.read ? <span className="size-1.5 shrink-0 rounded-full bg-brand" /> : null}
            </div>
            <p className="truncate text-[11px] text-muted-foreground">{item.description}</p>
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">{formatTime(item.createdAt)}</span>
        </Link>
      ))}
    </div>
  );
}
