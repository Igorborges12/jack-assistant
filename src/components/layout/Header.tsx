import type { ReactNode } from "react";

interface HeaderProps {
  eyebrow?: string | undefined;
  title: string;
  subtitle?: string | undefined;
  action?: ReactNode | undefined;
  onOpenMenu?: () => void;
}

export function Header({ eyebrow, title, subtitle, action, onOpenMenu }: HeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {onOpenMenu ? (
          <button
            onClick={onOpenMenu}
            aria-label="Abrir menu"
            className="glass grid size-10 shrink-0 place-items-center rounded-full lg:hidden"
          >
            ☰
          </button>
        ) : null}
        <div>
          {eyebrow ? (
            <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">{eyebrow}</p>
          ) : null}
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-balance">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="hidden shrink-0 items-center gap-3 sm:flex">{action}</div> : null}
    </div>
  );
}
