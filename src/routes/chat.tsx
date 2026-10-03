import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Card } from "@/components/common/Card";
import { AgentBadge } from "@/components/common/AgentBadge";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { chatService } from "@/services";
import { mockChat } from "@/mocks";
import type { ChatMessage as ChatMessageType } from "@/types";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — Jack" },
      {
        name: "description",
        content: "Converse com o orquestrador e os agentes do Jack.",
      },
      { property: "og:title", content: "Chat — Jack" },
      {
        property: "og:description",
        content: "Converse com o orquestrador e os agentes do Jack.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>(mockChat);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(content: string) {
    setMessages((prev) => [
      ...prev,
      { id: `m_${Date.now()}`, role: "user", content, timestamp: new Date().toISOString() },
    ]);
    setSending(true);
    const reply = await chatService.send(content);
    setMessages((prev) => [...prev, reply]);
    setSending(false);
  }

  return (
    <AppLayout
      eyebrow="Orchestrator"
      title="Chat"
      subtitle="Peça qualquer coisa — ações externas sempre passam por aprovação."
    >
      <Card className="flex min-h-[70vh] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Conversa</h2>
          <div className="flex flex-wrap gap-1.5">
            <AgentBadge agent="orchestrator" active />
            <AgentBadge agent="career" />
            <AgentBadge agent="email" />
            <AgentBadge agent="study" />
            <AgentBadge agent="life" />
          </div>
        </div>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {sending ? (
            <ChatMessage
              message={{
                id: "typing",
                role: "assistant",
                agent: "orchestrator",
                content: "Pensando",
                timestamp: new Date().toISOString(),
                streaming: true,
              }}
            />
          ) : null}
          <div ref={endRef} />
        </div>

        <div className="mt-4">
          <ChatInput onSend={handleSend} disabled={sending} />
        </div>
      </Card>
    </AppLayout>
  );
}
