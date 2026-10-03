import { Link } from "@tanstack/react-router";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "brand" | "muted" | "amber" | "mint";
  to?: string;
}

const hintTone: Record<NonNullable<StatCardProps["tone"]>, string> = {
  brand: "text-brand",
  muted: "text-muted-foreground",
  amber: "text-amber",
  mint: "text-mint",
};

export function StatCard({ label, value, hint, tone = "muted", to }: StatCardProps) {
  const body = (
    <>
      <p className="text-[11px] tracking-wider text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      {hint ? <p className={`mt-1 text-[11px] ${hintTone[tone]}`}>{hint}</p> : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className="glass block rounded-2xl p-4 transition hover:-translate-y-0.5 hover:bg-card/70">
        {body}
      </Link>
    );
  }
  return <div className="glass rounded-2xl p-4">{body}</div>;
}
