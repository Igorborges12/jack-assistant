/**
 * Centralized simulated replies for Jack. Replace `simulateReply` with
 * the FastAPI streaming call (/api/chat) later — the shape stays the same.
 * Replies only ever describe *prepared* actions, never executed ones.
 */
import type { AgentId } from "@/types";

interface Rule {
  agent: AgentId;
  keywords: string[];
  reply: (text: string) => string;
}

const rules: Rule[] = [
  {
    agent: "email",
    keywords: ["email", "e-mail", "inbox", "responder", "rascunho", "mensagem"],
    reply: () =>
      "Analisei sua caixa de entrada simulada: 4 e-mails importantes. Preparei um rascunho de resposta e o deixei em Aprovações — nada foi enviado.",
  },
  {
    agent: "career",
    keywords: ["vaga", "emprego", "candidatura", "currículo", "curriculo", "carreira", "entrevista"],
    reply: () =>
      "Encontrei 12 vagas nos dados simulados, 3 compatíveis com seu perfil. Posso preparar uma candidatura para revisão, mas nenhuma candidatura foi enviada.",
  },
  {
    agent: "study",
    keywords: ["estud", "curso", "matéria", "materia", "aprender", "revisar"],
    reply: () =>
      "Sugiro um bloco de 60 min de Sistemas distribuídos hoje às 09:00 e 30 min de inglês às 18:30. É apenas uma sugestão — nada foi agendado.",
  },
  {
    agent: "life",
    keywords: ["agenda", "evento", "reunião", "reuniao", "tarefa", "dia", "compromisso", "planejar"],
    reply: () =>
      "Você tem 3 eventos hoje e 2 tarefas pendentes. Preparei uma proposta de organização do dia; nenhum evento foi criado ou alterado.",
  },
];

export function detectAgent(text: string): AgentId {
  const lower = text.toLowerCase();
  return rules.find((rule) => rule.keywords.some((k) => lower.includes(k)))?.agent ?? "orchestrator";
}

export function simulateReply(text: string): { agent: AgentId; content: string } {
  const agent = detectAgent(text);
  const rule = rules.find((r) => r.agent === agent);
  return {
    agent,
    content: rule
      ? rule.reply(text)
      : `Entendi: "${text}". Quando o backend estiver conectado, vou encaminhar para o agente certo e pedir sua aprovação antes de qualquer ação externa.`,
  };
}

export const CHAT_SUGGESTIONS = [
  "Resumir meus e-mails importantes",
  "Buscar novas vagas de backend",
  "Planejar meu dia",
  "Sugerir um bloco de estudo",
];
