export type UserRole = 'HR' | 'INTERVIEWER'

/**
 * `authentication-service`'s `EmployeeResponse` has no creation timestamp,
 * so there's no `createdAt` here — don't add one back without a real
 * backend column to source it from (see `TeamMembersList` for the "member
 * since" column that was removed for this reason).
 */
export interface OrgUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
}
