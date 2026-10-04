import { StatusBadge } from "@/components/common/StatusBadge";
import type { StatusTone, Task } from "@/types";

const priorityTone: Record<Task["priority"], StatusTone> = {
  alta: "danger",
  média: "warning",
  baixa: "neutral",
};

export function TaskCard({ task, onToggle }: { task: Task; onToggle?: () => void }) {
  return (
    <div className="glass-soft flex items-center gap-3 rounded-2xl p-3.5">
      <button
        role="checkbox"
        aria-checked={task.done}
        aria-label={`Marcar "${task.title}" como ${task.done ? "pendente" : "concluída"}`}
        onClick={onToggle}
        className={`grid size-5 shrink-0 place-items-center rounded-md border text-[10px] transition ${
          task.done ? "gradient-brand border-transparent text-primary-foreground" : "border-muted-foreground/40 hover:border-brand"
        }`}
      >
        {task.done ? "✓" : ""}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${task.done ? "line-through opacity-60" : ""}`}>{task.title}</p>
        <p className="text-[11px] text-muted-foreground">{task.due}</p>
      </div>
      <StatusBadge label={task.priority} tone={priorityTone[task.priority]} />
    </div>
  );
}
