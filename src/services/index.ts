/**
 * Domain services. Each function maps to a future FastAPI endpoint:
 *
 *   /api/auth  /api/chat  /api/jobs  /api/applications  /api/emails
 *   /api/study /api/calendar /api/tasks /api/approvals /api/memories
 *
 * Today they read/write the in-memory session store (`@/mocks/db`);
 * swapping the body for `request<T>(path, …)` is the only change needed
 * once the backend exists. No real external action is ever performed.
 */
import { mockRequest } from "./http";
import { simulateReply } from "./chatResponder";
import { db, uid } from "@/mocks/db";
import { mockUser, mockSummary } from "@/mocks";
import type {
  ApplicationStage,
  CalendarEvent,
  ChatMessage,
  Course,
  EmailDraft,
  Job,
  StudySession,
  Subject,
  User,
} from "@/types";

const now = () => new Date().toISOString();

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
  history: () => mockRequest(db.get().chat),
  // POST /api/chat — will stream tokens from FastAPI later
  async send(content: string): Promise<ChatMessage> {
    const userMessage: ChatMessage = { id: uid("m"), role: "user", content, timestamp: now() };
    db.set((s) => ({ chat: [...s.chat, userMessage] }));
    const { agent, content: replyText } = simulateReply(content);
    const reply = await mockRequest<ChatMessage>(
      { id: uid("m"), role: "assistant", agent, content: replyText, timestamp: now() },
      900,
    );
    db.set((s) => ({ chat: [...s.chat, reply] }));
    return reply;
  },
  clear: () => db.set(() => ({ chat: [] })),
};

export const dashboardService = {
  summary: () => mockRequest(mockSummary),
};

export const careerService = {
  jobs: () => mockRequest(db.get().jobs),
  async saveJob(job: Omit<Job, "id"> & { id?: string }) {
    await mockRequest(null, 200);
    if (!job.title.trim() || !job.company.trim()) throw new Error("Cargo e empresa são obrigatórios.");
    if (job.id) {
      const id = job.id;
      db.set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...job, id } : j)) }));
    } else {
      db.set((s) => ({ jobs: [{ ...job, id: uid("j") }, ...s.jobs] }));
    }
  },
  async deleteJob(id: string) {
    await mockRequest(null, 150);
    db.set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) }));
  },
  toggleFavorite(id: string) {
    db.set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, favorite: !j.favorite } : j)) }));
  },
  applications: () => mockRequest(db.get().applications),
  updateStage(id: string, stage: ApplicationStage) {
    db.set((s) => ({
      applications: s.applications.map((a) =>
        a.id === id ? { ...a, stage, updatedAt: now().slice(0, 10) } : a,
      ),
    }));
  },
  companies: () => mockRequest(db.get().companies),
  resumes: () => mockRequest(db.get().resumes),
};

export const emailService = {
  inbox: () => mockRequest(db.get().emails),
  drafts: () => mockRequest(db.get().drafts),
  createDraft(draft: Omit<EmailDraft, "id" | "createdAt">) {
    db.set((s) => ({ drafts: [{ ...draft, id: uid("d"), createdAt: now() }, ...s.drafts] }));
  },
};

export const studyService = {
  addSubject(subject: Omit<Subject, "id">) {
    db.set((s) => ({ subjects: [...s.subjects, { ...subject, id: uid("su") }] }));
  },
  addCourse(course: Omit<Course, "id">) {
    db.set((s) => ({ courses: [...s.courses, { ...course, id: uid("co") }] }));
  },
  addSession(session: Omit<StudySession, "id">) {
    db.set((s) => ({ studyNext: [...s.studyNext, { ...session, id: uid("s") }] }));
  },
  updateCourseProgress(id: string, progress: number) {
    const value = Math.max(0, Math.min(100, progress));
    db.set((s) => ({ courses: s.courses.map((c) => (c.id === id ? { ...c, progress: value } : c)) }));
  },
};

export const calendarService = {
  events: () => mockRequest(db.get().events),
  addEvent(event: Omit<CalendarEvent, "id">) {
    db.set((s) => ({ events: [...s.events, { ...event, id: uid("ev") }] }));
  },
};

export const tasksService = {
  list: () => mockRequest(db.get().tasks),
  toggle(id: string) {
    db.set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
  },
};

export const approvalsService = {
  list: () => mockRequest(db.get().approvals),
  async decide(id: string, status: "approved" | "rejected") {
    await mockRequest(null, 250);
    db.set((s) => ({
      approvals: s.approvals.map((a) => (a.id === id ? { ...a, status, decidedAt: now() } : a)),
    }));
  },
};

export const notificationsService = {
  markRead(id: string) {
    db.set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  },
  markAllRead() {
    db.set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  },
};
