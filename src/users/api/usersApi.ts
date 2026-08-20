import { ApiError, authClient } from '@/shared/api/httpClient'
import type { OrgUser, UserRole } from '@/users/types/user'

export interface InviteTeammatePayload {
  firstName: string
  lastName: string
  email: string
  password: string
  role: UserRole
  username: string
}

export class EmailAlreadyInUseError extends Error {
  constructor() {
    super('That email is already in use.')
    this.name = 'EmailAlreadyInUseError'
  }
}

/**
 * The backend requires an employee's email to be on the organization's own
 * email domain (`EmployeeService.createEmployee` derives the domain from the
 * org's own signup email and rejects anything else) — surfaces the backend's
 * message directly since it names the exact required domain.
 */
export class InvalidEmployeeEmailError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidEmployeeEmailError'
  }
}

interface EmployeeResponseDto {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  organizationId: string
}

/**
 * The caller's own team roster (`GET /employees`, org-session only —
 * matches `createEmployee`'s auth shape). Returns `[]` for an employee
 * session or when signed out, same as every other org-scoped list here.
 */
export async function listOrganizationUsers(): Promise<OrgUser[]> {
  try {
    const employees = await authClient.get<EmployeeResponseDto[]>('/api/v1/employees')
    return employees.map((employee) => ({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      role: employee.role,
    }))
  } catch {
    return []
  }
}

/** Every employee of a given organization — for the admin console. */
export async function listOrganizationEmployeesForAdmin(organizationId: string): Promise<OrgUser[]> {
  try {
    const employees = await authClient.get<EmployeeResponseDto[]>(
      `/api/v1/admin/organizations/${organizationId}/employees`
    )
    return employees.map((employee) => ({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      role: employee.role,
    }))
  } catch {
    return []
  }
}

/**
 * Creates an HR/Interviewer account under the caller's organization. Requires
 * an active **organization** session (not an employee session) — see
 * `POST /employees` in the auth-service API.
 */
export async function inviteTeammate(payload: InviteTeammatePayload): Promise<OrgUser> {
  try {
    const employee = await authClient.post<EmployeeResponseDto>('/api/v1/employees', {
      username: payload.username,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
      role: payload.role,
    })

    return {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      role: employee.role,
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      throw new EmailAlreadyInUseError()
    }
    if (error instanceof ApiError && error.status === 400) {
      throw new InvalidEmployeeEmailError(error.message)
    }
    throw error
  }
}
