import type {
  AppNotification,
  Application,
  Approval,
  CalendarEvent,
  ChatMessage,
  Company,
  Course,
  DashboardSummary,
  EmailDraft,
  EmailItem,
  Job,
  Resume,
  StudySession,
  Subject,
  Task,
  User,
} from "@/types";

export const mockUser: User = {
  id: "u_1",
  name: "Igor",
  email: "igor@personalaios.app",
  plan: "Pro plan",
  initials: "IG",
};

export const mockSummary: DashboardSummary = {
  jobs: 12,
  importantEmails: 4,
  eventsToday: 3,
  pendingTasks: 2,
};

export const mockApprovals: Approval[] = [
  {
    id: "ap_1",
    agent: "career",
    action: "Revisar candidatura",
    description: "Candidatura para Senior Backend Engineer na Northwind aguarda sua revisão.",
    date: "2026-09-30T09:12:00",
    external: true,
    status: "pending",
  },
  {
    id: "ap_2",
    agent: "email",
    action: "Aprovar resposta de e-mail",
    description: "Resposta gerada para a proposta comercial da Lumen Tech.",
    date: "2026-09-30T08:47:00",
    external: true,
    status: "pending",
  },
  {
    id: "ap_3",
    agent: "life",
    action: "Confirmar evento",
    description: "Confirmar 1:1 com Ana na quinta-feira às 15:00.",
    date: "2026-09-29T18:20:00",
    external: true,
    status: "pending",
  },
];

export const mockChat: ChatMessage[] = [
  {
    id: "m_1",
    role: "assistant",
    agent: "orchestrator",
    content:
      "Revisei sua caixa de entrada e sua agenda. Você tem 3 aprovações pendentes e uma revisão às 14h. Quero preparar a pauta?",
    timestamp: "2026-09-30T08:40:00",
  },
  {
    id: "m_2",
    role: "user",
    content: "Sim, e adicione um intervalo de 30 minutos depois.",
    timestamp: "2026-09-30T08:41:00",
  },
  {
    id: "m_3",
    role: "assistant",
    agent: "life",
    content:
      "Pronto — pauta preparada e intervalo reservado. Envio para o time assim que você aprovar.",
    timestamp: "2026-09-30T08:41:00",
  },
];

export const mockJobs: Job[] = [
  {
    id: "j_1",
    title: "Senior Backend Engineer",
    company: "Northwind",
    location: "São Paulo, BR",
    modality: "Remoto",
    source: "LinkedIn",
    date: "2026-09-29",
    status: "new",
  },
  {
    id: "j_2",
    title: "Platform Engineer",
    company: "Lumen Tech",
    location: "Lisboa, PT",
    modality: "Híbrido",
    source: "Careers page",
    date: "2026-09-28",
    status: "applied",
  },
  {
    id: "j_3",
    title: "Data Engineer",
    company: "Corvus",
    location: "Remoto",
    modality: "Remoto",
    source: "Gupy",
    date: "2026-09-27",
    status: "interview",
  },
  {
    id: "j_4",
    title: "Tech Lead",
    company: "Atlas Labs",
    location: "Belo Horizonte, BR",
    modality: "Presencial",
    source: "Indeed",
    date: "2026-09-25",
    status: "saved",
  },
];

export const mockApplications: Application[] = [
  { id: "a_1", jobTitle: "Platform Engineer", company: "Lumen Tech", stage: "Triagem", updatedAt: "2026-09-29" },
  { id: "a_2", jobTitle: "Data Engineer", company: "Corvus", stage: "Entrevista técnica", updatedAt: "2026-09-28" },
  { id: "a_3", jobTitle: "Backend Engineer", company: "Vortex", stage: "Aguardando retorno", updatedAt: "2026-09-22" },
];

export const mockCompanies: Company[] = [
  { id: "c_1", name: "Northwind", segment: "Fintech", openRoles: 4 },
  { id: "c_2", name: "Lumen Tech", segment: "SaaS B2B", openRoles: 2 },
  { id: "c_3", name: "Corvus", segment: "Dados", openRoles: 6 },
];

export const mockResumes: Resume[] = [
  { id: "r_1", name: "CV Backend Sênior", target: "Backend / Platform", updatedAt: "2026-09-20" },
  { id: "r_2", name: "CV Dados", target: "Data Engineering", updatedAt: "2026-09-12" },
];

export const mockEmails: EmailItem[] = [
  {
    id: "e_1",
    from: "Mariana Alves",
    subject: "Proposta comercial — revisão final",
    preview: "Segue a versão ajustada do contrato para sua leitura...",
    receivedAt: "2026-09-30T08:10:00",
    important: true,
  },
  {
    id: "e_2",
    from: "Northwind Recruiting",
    subject: "Próximos passos da sua candidatura",
    preview: "Gostaríamos de agendar uma conversa inicial...",
    receivedAt: "2026-09-30T07:32:00",
    important: true,
  },
  {
    id: "e_3",
    from: "Notion",
    subject: "Resumo semanal do workspace",
    preview: "Sua equipe criou 14 páginas nesta semana...",
    receivedAt: "2026-09-29T19:04:00",
    important: false,
  },
  {
    id: "e_4",
    from: "Ana Ribeiro",
    subject: "1:1 de quinta",
    preview: "Podemos mover para as 15h?",
    receivedAt: "2026-09-29T16:22:00",
    important: true,
  },
];

export const mockDrafts: EmailDraft[] = [
  {
    id: "d_1",
    to: "mariana@lumen.tech",
    subject: "Re: Proposta comercial",
    preview: "Obrigado pelo envio. Tenho dois pontos sobre o escopo...",
    createdAt: "2026-09-30T08:45:00",
  },
  {
    id: "d_2",
    to: "recruiting@northwind.io",
    subject: "Re: Próximos passos",
    preview: "Tenho disponibilidade na terça e na quarta pela manhã...",
    createdAt: "2026-09-30T08:50:00",
  },
];

export const mockStudyToday: StudySession[] = [
  { id: "s_1", subject: "Sistemas distribuídos", topic: "Consenso e Raft", time: "09:00", durationMin: 60 },
  { id: "s_2", subject: "Inglês", topic: "Speaking — entrevistas", time: "18:30", durationMin: 30 },
];

export const mockStudyNext: StudySession[] = [
  { id: "s_3", subject: "Sistemas distribuídos", topic: "Sharding", time: "Amanhã, 09:00", durationMin: 60 },
  { id: "s_4", subject: "Arquitetura", topic: "Event sourcing", time: "Quinta, 20:00", durationMin: 45 },
];

export const mockCourses: Course[] = [
  { id: "co_1", name: "Designing Data-Intensive Applications", provider: "Leitura guiada", progress: 62 },
  { id: "co_2", name: "FastAPI avançado", provider: "TestDriven.io", progress: 38 },
  { id: "co_3", name: "English for Interviews", provider: "Cambly", progress: 74 },
];

export const mockSubjects: Subject[] = [
  { id: "su_1", name: "Sistemas distribuídos", hoursThisWeek: 5, progress: 60 },
  { id: "su_2", name: "Arquitetura de software", hoursThisWeek: 3, progress: 45 },
  { id: "su_3", name: "Inglês", hoursThisWeek: 2.5, progress: 74 },
];

export const mockEvents: CalendarEvent[] = [
  { id: "ev_1", title: "Deep work — roadmap", time: "09:00", date: "Hoje", kind: "Foco" },
  { id: "ev_2", title: "Design review", time: "14:00", date: "Hoje", kind: "Reunião", location: "Google Meet" },
  { id: "ev_3", title: "Estudo — sistemas distribuídos", time: "16:30", date: "Hoje", kind: "Estudo" },
  { id: "ev_4", title: "1:1 com Ana", time: "15:00", date: "Quinta", kind: "Reunião" },
  { id: "ev_5", title: "Consulta médica", time: "11:00", date: "Sexta", kind: "Pessoal" },
];

export const mockTasks: Task[] = [
  { id: "t_1", title: "Atualizar currículo de dados", due: "Hoje", priority: "alta", done: false },
  { id: "t_2", title: "Responder proposta da Lumen", due: "Amanhã", priority: "média", done: false },
  { id: "t_3", title: "Revisar anotações de Raft", due: "Quinta", priority: "baixa", done: true },
];

export const mockNotifications: AppNotification[] = [
  {
    id: "n_1",
    agent: "career",
    title: "3 novas vagas encontradas",
    description: "Vagas compatíveis com seu perfil de Backend Sênior.",
    createdAt: "2026-09-30T08:05:00",
    read: false,
    to: "/career",
  },
  {
    id: "n_2",
    agent: "email",
    title: "Rascunho preparado",
    description: "Resposta para a Lumen Tech aguarda sua revisão.",
    createdAt: "2026-09-30T08:46:00",
    read: false,
    to: "/approvals",
  },
  {
    id: "n_3",
    agent: "study",
    title: "Sessão de estudo em 1 hora",
    description: "Sistemas distribuídos — Consenso e Raft.",
    createdAt: "2026-09-30T08:00:00",
    read: true,
    to: "/study",
  },
];
