import { ApiError, applicationClient } from "@/shared/api/httpClient";
import type { Candidate, CandidateStage } from "@/candidates/types/candidate";

/**
 * The backend allows only one application per (jobId, email) pair
 * (`ApplicationService.createApplication`'s `existsByJobIdAndEmail` check) —
 * a candidate re-applying with the same email to a job they've already
 * applied to gets this, not a generic failure.
 */
export class DuplicateApplicationError extends Error {
  constructor() {
    super("You've already applied to this job with that email address.");
    this.name = "DuplicateApplicationError";
  }
}

interface ApplicationResponse {
  id: string;
  jobId: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  status: CandidateStage;
  createdAt: string;
  updatedAt: string;
}

function toCandidate(response: ApplicationResponse): Candidate {
  return {
    id: response.id,
    organizationId: response.organizationId,
    jobId: response.jobId,
    firstName: response.firstName,
    lastName: response.lastName,
    name: `${response.firstName} ${response.lastName}`.trim(),
    email: response.email,
    phone: response.phone,
    resumeUrl: response.resumeUrl,
    stage: response.status,
    appliedAt: response.createdAt,
    updatedAt: response.updatedAt,
  };
}

/** Candidates belonging to the signed-in employee's organization (requires an HR/Interviewer session). */
export async function listCandidates(): Promise<Candidate[]> {
  try {
    const applications = await applicationClient.get<ApplicationResponse[]>("/api/v1/applications");
    return applications.map(toCandidate);
  } catch {
    return [];
  }
}

/**
 * Every candidate across every organization — for the admin console.
 *
 * BACKEND GAP: `GET /applications` is scoped to the caller's own org via
 * their employee session (same shape of gap as `listAllJobs()`), and there's
 * no admin-facing cross-org equivalent. Returns `[]` until that endpoint
 * exists rather than fabricating data.
 */
export async function listAllCandidates(): Promise<Candidate[]> {
  return [];
}

/**
 * Moves a candidate to a different stage via the real status PATCH. This
 * replaces the mock's localStorage board-order rewrite — the backend has no
 * concept of "board column order," only `status`, so intra-column
 * drag-and-drop reordering is now local-only UI state (see
 * `CandidatesBoard.tsx`): it's never persisted and never sent here.
 */
export async function setCandidateStage(candidateId: string, stage: CandidateStage): Promise<void> {
  await applicationClient.patch<void>(`/api/v1/applications/${candidateId}/status`, {
    status: stage,
  });
}

export interface ApplyToJobPayload {
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeFile: File;
}

/**
 * Public, unauthenticated job application. No session/org id needs to be
 * passed — the backend resolves the owning organization from `jobId` itself.
 */
export async function applyToJob(payload: ApplyToJobPayload): Promise<Candidate> {
  const formData = new FormData();
  formData.append("jobId", payload.jobId);
  formData.append("firstName", payload.firstName);
  formData.append("lastName", payload.lastName);
  formData.append("email", payload.email);
  if (payload.phone) formData.append("phone", payload.phone);
  formData.append("resume", payload.resumeFile);

  try {
    const response = await applicationClient.post<ApplicationResponse>("/api/v1/applications", formData);
    return toCandidate(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      throw new DuplicateApplicationError();
    }
    throw error;
  }
}
