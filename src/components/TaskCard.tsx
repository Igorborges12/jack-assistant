import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusTone, Task } from "@/types";

const priorityTone: Record<Task["priority"], StatusTone> = {
  alta: "danger",
  média: "warning",
  baixa: "neutral",
};

export function TaskCard({ task }: { task: Task }) {
  return (
    <div className="glass-soft flex items-center gap-3 rounded-2xl p-3.5">
      <span
        aria-hidden
        className={`grid size-5 shrink-0 place-items-center rounded-md border text-[10px] ${
          task.done ? "gradient-brand border-transparent text-primary-foreground" : "border-border"
        }`}
      >
        {task.done ? "✓" : ""}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${task.done ? "line-through opacity-60" : ""}`}>
          {task.title}
        </p>
        <p className="text-[11px] text-muted-foreground">{task.due}</p>
      </div>
      <StatusBadge label={task.priority} tone={priorityTone[task.priority]} />
    </div>
  );
}
