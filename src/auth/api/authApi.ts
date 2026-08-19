import type { LoginFormValues } from '@/auth/validation/loginSchema'
import type { EmployeeLoginFormValues } from '@/auth/validation/employeeLoginSchema'
import type { ForgotPasswordFormValues } from '@/auth/validation/forgotPasswordSchema'
import type { ResetPasswordFormValues } from '@/auth/validation/resetPasswordSchema'
import type { Organization } from '@/organizations/types/organization'
import { ApiError, authClient } from '@/shared/api/httpClient'
import { clearAdminSession } from '@/organizations/utils/organizationStore'

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password.')
    this.name = 'InvalidCredentialsError'
  }
}

/**
 * `OrganizationService.login` throws this (403) for an org with correct
 * credentials but `status !== ACCEPTED` — the credentials are right, so
 * showing "check your credentials" would be actively misleading. The 403
 * body doesn't distinguish PENDING from REJECTED (both just say "not been
 * accepted yet"), so this can't route to the specific status screen the way
 * a successful login does via `STATUS_DESTINATION` — it can only explain why
 * sign-in failed.
 */
export class OrganizationNotAcceptedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OrganizationNotAcceptedError'
  }
}

export class OrganizationNotFoundError extends Error {
  constructor() {
    super("We couldn't find an organization for that email domain.")
    this.name = 'OrganizationNotFoundError'
  }
}

export class AmbiguousOrganizationDomainError extends Error {
  constructor() {
    super('More than one organization uses that email domain. Contact your organization for help signing in.')
    this.name = 'AmbiguousOrganizationDomainError'
  }
}

/**
 * Signs in an **organization** account (the account created at `/register`).
 */
export async function login(values: LoginFormValues): Promise<Organization> {
  try {
    const organization = await authClient.post<Organization>('/api/v1/organizations/login', {
      email: values.email,
      password: values.password,
    })
    // An org session and an admin session are mutually exclusive — see
    // `adminLogin()`, which clears this one in the same way.
    clearAdminSession()
    return organization
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
      throw new InvalidCredentialsError()
    }
    if (error instanceof ApiError && error.status === 403) {
      throw new OrganizationNotAcceptedError(error.message)
    }
    throw error
  }
}

export interface EmployeeLoginPayload {
  organizationId: string
  username: string
  password: string
}

export interface EmployeeSession {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  role: 'HR' | 'INTERVIEWER'
  organizationId: string
}

/**
 * Resolves the organization id for an employee's work email, via the
 * domain-matching `GET /organizations/lookup` endpoint (employee emails are
 * required to be on their organization's email domain — see
 * `EmployeeService.createEmployee` on the backend). This is what lets the
 * employee login form ask for a plain work email instead of a raw org id.
 */
async function lookupOrganizationId(employeeEmail: string): Promise<string> {
  try {
    const result = await authClient.get<{ organizationId: string }>(
      `/api/v1/organizations/lookup?employeeEmail=${encodeURIComponent(employeeEmail)}`
    )
    return result.organizationId
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new OrganizationNotFoundError()
    }
    if (error instanceof ApiError && error.status === 409) {
      throw new AmbiguousOrganizationDomainError()
    }
    throw error
  }
}

/**
 * Signs in an HR/Interviewer employee account. Looks up the organization id
 * from the work email's domain first, then authenticates against
 * `POST /employees/login`.
 */
export async function employeeLogin(values: EmployeeLoginFormValues): Promise<EmployeeSession> {
  const organizationId = await lookupOrganizationId(values.email)
  try {
    const session = await authClient.post<EmployeeSession>('/api/v1/employees/login', {
      organizationId,
      username: values.username,
      password: values.password,
    } satisfies EmployeeLoginPayload)
    clearAdminSession()
    return session
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
      throw new InvalidCredentialsError()
    }
    if (error instanceof ApiError && error.status === 403) {
      throw new OrganizationNotAcceptedError(error.message)
    }
    throw error
  }
}

export async function logout(): Promise<void> {
  try {
    await authClient.post<void>('/api/v1/organizations/logout')
  } catch {
    // Best-effort — even if the request fails, there's nothing more the
    // client can do about clearing an HttpOnly cookie itself.
  }
}

export class OrganizationEmailNotFoundError extends Error {
  constructor() {
    super("We couldn't find an organization registered with that email.")
    this.name = 'OrganizationEmailNotFoundError'
  }
}

/**
 * `OrganizationService.forgotPassword` throws a 404 before ever generating
 * a token or calling the email service when no organization matches, and a
 * 403 when the organization exists but isn't `ACCEPTED` yet — no email is
 * sent in either case. Surface both as distinct errors so the form can
 * tell the user outright, instead of pretending an email went out that
 * never did.
 */
export async function forgotPassword(values: ForgotPasswordFormValues): Promise<void> {
  try {
    await authClient.post<void>('/api/v1/organizations/forgot-password', {
      email: values.email,
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new OrganizationEmailNotFoundError()
    }
    if (error instanceof ApiError && error.status === 403) {
      throw new OrganizationNotAcceptedError(error.message)
    }
    throw error
  }
}

export class InvalidResetTokenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidResetTokenError'
  }
}

/**
 * Pre-validates a reset token (e.g. as soon as `/reset-password?token=...`
 * loads) so the form can show "this link is invalid or expired" up front
 * instead of only after the user fills in a new password.
 */
export async function verifyResetPasswordToken(token: string): Promise<void> {
  try {
    await authClient.post<void>('/api/v1/organizations/reset-password/verify', { token })
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      throw new InvalidResetTokenError(error.message)
    }
    throw error
  }
}

export async function resetPassword(token: string, values: ResetPasswordFormValues): Promise<void> {
  try {
    await authClient.post<void>('/api/v1/organizations/reset-password', {
      token,
      newPassword: values.newPassword,
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      throw new InvalidResetTokenError(error.message)
    }
    throw error
  }
}
