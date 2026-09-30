interface LoadingStateProps {
  rows?: number;
  label?: string;
}

export function LoadingState({ rows = 3, label }: LoadingStateProps) {
  return (
    <div className="space-y-2.5" role="status" aria-label={label ?? "Carregando"}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-12 animate-pulse rounded-xl bg-foreground/5"
          style={{ animationDelay: `${index * 90}ms` }}
        />
      ))}
    </div>
  );
}
