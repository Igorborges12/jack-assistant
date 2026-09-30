export type AgentId = "orchestrator" | "career" | "email" | "study" | "life";

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  initials: string;
}

export interface DashboardSummary {
  jobs: number;
  importantEmails: number;
  eventsToday: number;
  pendingTasks: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  agent?: AgentId;
  /** Reserved for future token streaming from the FastAPI backend. */
  streaming?: boolean;
}

export type JobStatus = "new" | "applied" | "interview" | "rejected" | "saved";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  modality: "Remoto" | "Híbrido" | "Presencial";
  source: string;
  date: string;
  status: JobStatus;
}

export interface Application {
  id: string;
  jobTitle: string;
  company: string;
  stage: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  segment: string;
  openRoles: number;
}

export interface Resume {
  id: string;
  name: string;
  target: string;
  updatedAt: string;
}

export interface EmailItem {
  id: string;
  from: string;
  subject: string;
  preview: string;
  receivedAt: string;
  important: boolean;
}

export interface EmailDraft {
  id: string;
  to: string;
  subject: string;
  preview: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  time: string;
  durationMin: number;
}

export interface Course {
  id: string;
  name: string;
  provider: string;
  progress: number;
}

export interface Subject {
  id: string;
  name: string;
  hoursThisWeek: number;
  progress: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  kind: "Reunião" | "Foco" | "Pessoal" | "Estudo";
  location?: string;
}

export interface Task {
  id: string;
  title: string;
  due: string;
  priority: "baixa" | "média" | "alta";
  done: boolean;
}

export interface Approval {
  id: string;
  agent: AgentId;
  action: string;
  description: string;
  date: string;
}
