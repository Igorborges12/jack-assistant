import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/common/Card";
import { AgentBadge } from "@/components/common/AgentBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useDb } from "@/hooks/useDb";
import { chatService } from "@/services";
import { CHAT_SUGGESTIONS, detectAgent } from "@/services/chatResponder";
import type { AgentId } from "@/types";

export const Route = createFileRoute("/chat")({
  validateSearch: (search: Record<string, unknown>): { q?: string | undefined } => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Chat — Jack" },
      { name: "description", content: "Converse com o Jack e veja qual agente cuidaria de cada pedido." },
      { property: "og:title", content: "Chat — Jack" },
      { property: "og:description", content: "Converse com o Jack e veja qual agente cuidaria de cada pedido." },
    ],
  }),
  component: ChatPage,
});

const AGENTS: AgentId[] = ["orchestrator", "career", "email", "study", "life"];

function ChatPage() {
  const messages = useDb((s) => s.chat);
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [pendingAgent, setPendingAgent] = useState<AgentId | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const handledQuery = useRef<string | null>(null);

  const lastAgent = [...messages].reverse().find((m) => m.agent)?.agent ?? "orchestrator";
  const activeAgent = pendingAgent ?? lastAgent;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingAgent]);

  async function handleSend(content: string) {
    if (pendingAgent) return;
    setPendingAgent(detectAgent(content));
    try {
      await chatService.send(content);
    } finally {
      setPendingAgent(null);
    }
  }

  useEffect(() => {
    if (q && handledQuery.current !== q) {
      handledQuery.current = q;
      navigate({ to: "/chat", search: {}, replace: true });
      void handleSend(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <AppLayout eyebrow="Jack" title="Chat" subtitle="Peça qualquer coisa — ações externas sempre passam por aprovação.">
      <Card className="flex min-h-[70vh] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Conversa</h2>
          <div className="flex flex-wrap items-center gap-1.5">
            {AGENTS.map((agent) => (
              <AgentBadge key={agent} agent={agent} active={agent === activeAgent} />
            ))}
            {messages.length > 0 ? (
              <button onClick={chatService.clear} className="ml-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                Limpar
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1" aria-live="polite">
          {messages.length === 0 && !pendingAgent ? (
            <EmptyState title="Comece uma conversa" description="Escolha uma sugestão abaixo ou escreva o que precisa." />
          ) : null}
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {pendingAgent ? (
            <ChatMessage
              message={{
                id: "typing",
                role: "assistant",
                agent: pendingAgent,
                content: "Jack está preparando a resposta",
                timestamp: new Date().toISOString(),
                streaming: true,
              }}
            />
          ) : null}
          <div ref={endRef} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CHAT_SUGGESTIONS.map((s) => (
            <button
              key={s}
              disabled={!!pendingAgent}
              onClick={() => handleSend(s)}
              className="glass-soft rounded-full px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-60"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <ChatInput onSend={handleSend} disabled={!!pendingAgent} />
        </div>
      </Card>
    </AppLayout>
  );
}
