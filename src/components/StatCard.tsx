interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "brand" | "muted" | "amber" | "mint";
}

const hintTone: Record<NonNullable<StatCardProps["tone"]>, string> = {
  brand: "text-brand",
  muted: "text-muted-foreground",
  amber: "text-amber",
  mint: "text-mint",
};

export function StatCard({ label, value, hint, tone = "muted" }: StatCardProps) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-[11px] tracking-wider text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      {hint ? <p className={`mt-1 text-[11px] ${hintTone[tone]}`}>{hint}</p> : null}
    </div>
  );
}
