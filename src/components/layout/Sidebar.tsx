import { Link, useNavigate } from "@tanstack/react-router";
import { mockUser } from "@/mocks";
import { useDb } from "@/hooks/useDb";

interface NavItem {
  to: string;
  label: string;
  glyph: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Início", glyph: "⌂" },
  { to: "/chat", label: "Chat", glyph: "✦" },
  { to: "/career", label: "Carreira", glyph: "◈" },
  { to: "/email", label: "E-mail", glyph: "✉" },
  { to: "/study", label: "Estudos", glyph: "✎" },
  { to: "/agenda", label: "Agenda", glyph: "▤" },
  { to: "/approvals", label: "Aprovações", glyph: "✓", badge: "approvals" },
  { to: "/settings", label: "Configurações", glyph: "⚙" },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const pendingCount = useDb((s) => s.approvals.filter((a) => a.status === "pending").length);

  return (
    <div className="glass flex h-full flex-col rounded-3xl p-4">
      <div className="flex items-center gap-2.5 px-2 py-2">
        <div className="gradient-brand shadow-brand grid size-9 place-items-center rounded-xl font-display text-sm font-bold text-primary-foreground">
          J
        </div>
        <div>
          <p className="font-display text-[15px] leading-none font-semibold">Jack</p>
          <p className="mt-1 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Personal AI OS
          </p>
        </div>
      </div>

      <nav className="mt-6 space-y-1 text-sm">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            activeProps={{ className: "bg-card/80 text-brand font-semibold shadow-sm" }}
            inactiveProps={{ className: "text-muted-foreground hover:bg-card/60" }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition"
          >
            <span aria-hidden className="text-base">
              {item.glyph}
            </span>
            {item.label}
            {item.badge && pendingCount > 0 ? (
              <span className="ml-auto rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                {pendingCount}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="glass-soft mt-auto rounded-2xl p-3">
        <div className="flex items-center gap-2.5">
          <div className="gradient-brand grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-primary-foreground">
            {mockUser.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold">{mockUser.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{mockUser.plan}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Link
            to="/settings"
            onClick={onNavigate}
            className="glass-soft flex-1 rounded-lg px-3 py-1.5 text-center text-[11px] font-semibold text-muted-foreground transition hover:text-foreground"
          >
            Configurações
          </Link>
          <button
            onClick={() => navigate({ to: "/" })}
            className="glass-soft flex-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition hover:text-foreground"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
