import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types";

const toneClasses: Record<StatusTone, string> = {
  neutral: "glass-soft text-muted-foreground",
  info: "bg-brand/10 text-brand",
  success: "bg-mint/15 text-mint",
  warning: "bg-amber/20 text-amber",
  danger: "bg-rose/15 text-rose",
};

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  className?: string;
}

export function StatusBadge({ label, tone = "neutral", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        toneClasses[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
