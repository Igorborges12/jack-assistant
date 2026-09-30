import { AGENT_LABELS } from "@/lib/agents";
import { formatTime } from "@/lib/format";
import type { ChatMessage as ChatMessageType } from "@/types";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5">
        <div className="max-w-[75%]">
          <div className="gradient-brand rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-primary-foreground">
            {message.content}
          </div>
          <p className="mt-1 text-right text-[10px] text-muted-foreground">
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      <div className="gradient-brand grid size-8 shrink-0 place-items-center rounded-full text-xs text-primary-foreground">
        ✦
      </div>
      <div className="max-w-[75%]">
        <div className="glass-soft rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm">
          {message.content}
          {message.streaming ? <span className="ml-1 animate-pulse">▍</span> : null}
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {message.agent ? `${AGENT_LABELS[message.agent]} · ` : ""}
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
