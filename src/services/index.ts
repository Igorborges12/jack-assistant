/**
 * Domain services. Each function maps 1:1 to a future FastAPI endpoint:
 *
 *   /api/auth  /api/chat  /api/jobs  /api/applications  /api/emails
 *   /api/study /api/calendar /api/tasks /api/approvals /api/memories
 *
 * Today they resolve mock data; swapping in `request<T>(path)` is the
 * only change needed once the backend exists.
 */
import { mockRequest } from "./http";
import {
  mockApplications,
  mockApprovals,
  mockChat,
  mockCompanies,
  mockCourses,
  mockDrafts,
  mockEmails,
  mockEvents,
  mockJobs,
  mockResumes,
  mockStudyNext,
  mockStudyToday,
  mockSubjects,
  mockSummary,
  mockTasks,
  mockUser,
} from "@/mocks";
import type { ChatMessage, User } from "@/types";

export const authService = {
  // POST /api/auth/login
  login: (email: string, _password: string) =>
    mockRequest<User>({ ...mockUser, email: email || mockUser.email }),
  // GET /api/auth/me
  me: () => mockRequest(mockUser),
  // POST /api/auth/logout
  logout: () => mockRequest(true, 80),
};

export const chatService = {
  // GET /api/chat
  history: () => mockRequest(mockChat),
  // POST /api/chat  (will stream tokens once the backend is ready)
  send: (content: string): Promise<ChatMessage> =>
    mockRequest<ChatMessage>({
      id: `m_${Date.now()}`,
      role: "assistant",
      agent: "orchestrator",
      content: `Recebi: "${content}". Quando o backend estiver conectado, vou executar essa tarefa e pedir sua aprovação antes de qualquer ação externa.`,
      timestamp: new Date().toISOString(),
    }, 700),
};

export const dashboardService = {
  summary: () => mockRequest(mockSummary),
};

export const careerService = {
  jobs: () => mockRequest(mockJobs),
  applications: () => mockRequest(mockApplications),
  companies: () => mockRequest(mockCompanies),
  resumes: () => mockRequest(mockResumes),
};

export const emailService = {
  inbox: () => mockRequest(mockEmails),
  important: () => mockRequest(mockEmails.filter((e) => e.important)),
  drafts: () => mockRequest(mockDrafts),
};

export const studyService = {
  today: () => mockRequest(mockStudyToday),
  next: () => mockRequest(mockStudyNext),
  courses: () => mockRequest(mockCourses),
  subjects: () => mockRequest(mockSubjects),
};

export const calendarService = {
  events: () => mockRequest(mockEvents),
};

export const tasksService = {
  list: () => mockRequest(mockTasks),
};

export const approvalsService = {
  list: () => mockRequest(mockApprovals),
  approve: (id: string) => mockRequest({ id, status: "approved" as const }, 150),
  reject: (id: string) => mockRequest({ id, status: "rejected" as const }, 150),
};
