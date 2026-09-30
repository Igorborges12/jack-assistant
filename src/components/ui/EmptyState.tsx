interface EmptyStateProps {
  title: string;
  description?: string;
  glyph?: string;
}

export function EmptyState({ title, description, glyph = "✦" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl px-6 py-10 text-center">
      <div className="gradient-brand grid size-10 place-items-center rounded-2xl text-primary-foreground">
        <span aria-hidden>{glyph}</span>
      </div>
      <p className="mt-3 text-sm font-medium">{title}</p>
      {description ? (
        <p className="mt-1 max-w-xs text-[12px] text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
