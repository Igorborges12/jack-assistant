/**
 * In-memory mock database. Lives for the browser session so state
 * (chat history, approvals, edits) survives navigation between pages.
 * Only the service layer mutates it; pages read it through `useDb`.
 * When the FastAPI backend exists, services call the API instead and
 * this module can be removed.
 */
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
  mockNotifications,
  mockResumes,
  mockStudyNext,
  mockStudyToday,
  mockSubjects,
  mockTasks,
} from "./index";
import type {
  AppNotification,
  Application,
  Approval,
  CalendarEvent,
  ChatMessage,
  Company,
  Course,
  EmailDraft,
  EmailItem,
  Job,
  Resume,
  StudySession,
  Subject,
  Task,
} from "@/types";

export interface DbState {
  jobs: Job[];
  applications: Application[];
  companies: Company[];
  resumes: Resume[];
  emails: EmailItem[];
  drafts: EmailDraft[];
  studyToday: StudySession[];
  studyNext: StudySession[];
  courses: Course[];
  subjects: Subject[];
  events: CalendarEvent[];
  tasks: Task[];
  approvals: Approval[];
  notifications: AppNotification[];
  chat: ChatMessage[];
}

let state: DbState = {
  jobs: mockJobs.map((job) => ({ ...job, favorite: job.status === "saved" })),
  applications: [...mockApplications],
  companies: [...mockCompanies],
  resumes: [...mockResumes],
  emails: mockEmails.map((email) => ({ ...email, body: email.body ?? email.preview })),
  drafts: [...mockDrafts],
  studyToday: [...mockStudyToday],
  studyNext: [...mockStudyNext],
  courses: [...mockCourses],
  subjects: [...mockSubjects],
  events: [...mockEvents],
  tasks: [...mockTasks],
  approvals: [...mockApprovals],
  notifications: [...mockNotifications],
  chat: [...mockChat],
};

const listeners = new Set<() => void>();
const initialState = state;

export const db = {
  get: () => state,
  getInitial: () => initialState,
  set(updater: (prev: DbState) => Partial<DbState>) {
    state = { ...state, ...updater(state) };
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
