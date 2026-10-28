
/**
 * Domain services for Jack.
 *
 * Career jobs and applications use FastAPI/MySQL.
 * Other modules continue using the in-memory session store.
 *
 * No job application is submitted automatically.
 */

import { mockRequest } from "./http";
import { jobsApi } from "./jobsApi";
import {
  applicationsApi,
  type ApiApplication,
} from "./applicationsApi";
import { simulateReply } from "./chatResponder";

import { db, uid } from "@/mocks/db";
import { mockUser, mockSummary } from "@/mocks";

import type {
  Application,
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

// =====================================================
// APPLICATION HELPERS
// =====================================================

const backendStageToFrontend = (
  stage: string,
): ApplicationStage => {
  const stages: Record<string, ApplicationStage> = {
    applied: "Triagem",
    screening: "Triagem",
    interview: "Entrevista RH",
    hr_interview: "Entrevista RH",
    technical_interview: "Entrevista técnica",
    offer: "Proposta",
    waiting: "Aguardando retorno",
    rejected: "Encerrada",
    closed: "Encerrada",
  };

  return stages[stage] ?? "Triagem";
};

const frontendStageToBackend = (
  stage: ApplicationStage,
): string => {
  const stages: Record<ApplicationStage, string> = {
    Triagem: "applied",
    "Entrevista RH": "hr_interview",
    "Entrevista técnica": "technical_interview",
    Proposta: "offer",
    "Aguardando retorno": "waiting",
    Encerrada: "closed",
  };

  return stages[stage];
};

const toApplication = (
  application: ApiApplication,
  jobs: Job[],
): Application => {
  const job = jobs.find(
    (item) => item.id === String(application.job_id),
  );

  return {
    id: String(application.id),
    jobId: String(application.job_id),
    jobTitle: job?.title ?? "Vaga não encontrada",
    company: job?.company ?? "Empresa não encontrada",
    stage: backendStageToFrontend(application.stage),
    updatedAt: application.updated_at.slice(0, 10),
  };
};

export const authService = {
  login: (email: string, _password: string) =>
    mockRequest<User>({
      ...mockUser,
      email: email || mockUser.email,
    }),

  me: () => mockRequest(mockUser),

  logout: () => mockRequest(true, 80),
};

export const chatService = {
  history: () => mockRequest(db.get().chat),

  async send(content: string): Promise<ChatMessage> {
    const userMessage: ChatMessage = {
      id: uid("m"),
      role: "user",
      content,
      timestamp: now(),
    };

    db.set((s) => ({
      chat: [...s.chat, userMessage],
    }));

    const { agent, content: replyText } =
      simulateReply(content);

    const reply = await mockRequest<ChatMessage>(
      {
        id: uid("m"),
        role: "assistant",
        agent,
        content: replyText,
        timestamp: now(),
      },
      900,
    );

    db.set((s) => ({
      chat: [...s.chat, reply],
    }));

    return reply;
  },

  clear: () =>
    db.set(() => ({
      chat: [],
    })),
};

export const dashboardService = {
  summary: () => mockRequest(mockSummary),
};

// =====================================================
// CAREER SERVICE - FASTAPI + MYSQL
// =====================================================

export const careerService = {
  // GET /api/jobs
  async jobs(): Promise<Job[]> {
    const jobs = await jobsApi.list();

    db.set(() => ({
      jobs,
    }));

    return jobs;
  },

  // POST /api/jobs ou PUT /api/jobs/{id}
  async saveJob(
    job: Omit<Job, "id"> & { id?: string },
  ): Promise<void> {
    if (!job.title.trim() || !job.company.trim()) {
      throw new Error(
        "Cargo e empresa são obrigatórios.",
      );
    }

    const savedJob = await jobsApi.save(job);

    db.set((s) => {
      if (job.id) {
        return {
          jobs: s.jobs.map((existing) =>
            existing.id === savedJob.id
              ? savedJob
              : existing,
          ),
        };
      }

      return {
        jobs: [savedJob, ...s.jobs],
      };
    });
  },

  // DELETE /api/jobs/{id}
  async deleteJob(id: string): Promise<void> {
    await jobsApi.remove(id);

    db.set((s) => ({
      jobs: s.jobs.filter(
        (job) => job.id !== id,
      ),
    }));
  },

  // PUT /api/jobs/{id}
  async toggleFavorite(id: string): Promise<void> {
    const job = db
      .get()
      .jobs.find((item) => item.id === id);

    if (!job) {
      throw new Error("Vaga não encontrada.");
    }

    const updatedJob =
      await jobsApi.toggleFavorite(job);

    db.set((s) => ({
      jobs: s.jobs.map((existing) =>
        existing.id === id
          ? updatedJob
          : existing,
      ),
    }));
  },

  // GET /api/applications
  async applications(): Promise<Application[]> {
    const [apiApplications, jobs] = await Promise.all([
      applicationsApi.list(),
      jobsApi.list(),
    ]);

    const applications = apiApplications.map(
      (application) => toApplication(application, jobs),
    );

    db.set(() => ({
      jobs,
      applications,
    }));

    return applications;
  },

  // PUT /api/applications/{id}
  async updateStage(
    id: string,
    stage: ApplicationStage,
  ): Promise<void> {
    const updated = await applicationsApi.update(
      Number(id),
      {
        stage: frontendStageToBackend(stage),
      },
    );

    db.set((s) => ({
      applications: s.applications.map((application) =>
        application.id === id
          ? {
              ...application,
              stage: backendStageToFrontend(updated.stage),
              updatedAt: updated.updated_at.slice(0, 10),
            }
          : application,
      ),
    }));
  },

  companies: () =>
    mockRequest(db.get().companies),

  resumes: () =>
    mockRequest(db.get().resumes),
};

// =====================================================
// EMAIL SERVICE
// =====================================================

export const emailService = {
  inbox: () =>
    mockRequest(db.get().emails),

  drafts: () =>
    mockRequest(db.get().drafts),

  createDraft(
    draft: Omit<
      EmailDraft,
      "id" | "createdAt"
    >,
  ) {
    db.set((s) => ({
      drafts: [
        {
          ...draft,
          id: uid("d"),
          createdAt: now(),
        },
        ...s.drafts,
      ],
    }));
  },
};

// =====================================================
// STUDY SERVICE
// =====================================================

export const studyService = {
  addSubject(
    subject: Omit<Subject, "id">,
  ) {
    db.set((s) => ({
      subjects: [
        ...s.subjects,
        {
          ...subject,
          id: uid("su"),
        },
      ],
    }));
  },

  addCourse(
    course: Omit<Course, "id">,
  ) {
    db.set((s) => ({
      courses: [
        ...s.courses,
        {
          ...course,
          id: uid("co"),
        },
        ...s.courses,
      ],
    }));
  },

  addSession(
    session: Omit<StudySession, "id">,
  ) {
    db.set((s) => ({
      studyNext: [
        ...s.studyNext,
        {
          ...session,
          id: uid("s"),
        },
      ],
    }));
  },

  updateCourseProgress(
    id: string,
    progress: number,
  ) {
    const value = Math.max(
      0,
      Math.min(100, progress),
    );

    db.set((s) => ({
      courses: s.courses.map((c) =>
        c.id === id
          ? { ...c, progress: value }
          : c,
      ),
    }));
  },
};

// =====================================================
// CALENDAR SERVICE
// =====================================================

export const calendarService = {
  events: () =>
    mockRequest(db.get().events),

  addEvent(
    event: Omit<CalendarEvent, "id">,
  ) {
    db.set((s) => ({
      events: [
        ...s.events,
        {
          ...event,
          id: uid("ev"),
        },
      ],
    }));
  },
};

// =====================================================
// TASKS SERVICE
// =====================================================

export const tasksService = {
  list: () =>
    mockRequest(db.get().tasks),

  toggle(id: string) {
    db.set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id
          ? { ...t, done: !t.done }
          : t,
      ),
    }));
  },
};

// =====================================================
// APPROVALS SERVICE
// =====================================================

export const approvalsService = {
  list: () =>
    mockRequest(db.get().approvals),

  async decide(
    id: string,
    status: "approved" | "rejected",
  ) {
    await mockRequest(null, 250);

    db.set((s) => ({
      approvals: s.approvals.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              decidedAt: now(),
            }
          : a,
      ),
    }));
  },
};

// =====================================================
// NOTIFICATIONS SERVICE
// =====================================================

export const notificationsService = {
  markRead(id: string) {
    db.set((s) => ({
      notifications:
        s.notifications.map((n) =>
          n.id === id
            ? { ...n, read: true }
            : n,
        ),
    }));
  },

  markAllRead() {
    db.set((s) => ({
      notifications:
        s.notifications.map((n) => ({
          ...n,
          read: true,
        })),
    }));
  },
};
