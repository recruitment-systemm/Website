export type OrganizationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface Organization {
  id: string
  name: string
  email: string
  status: OrganizationStatus
  requestedAt: string
  taxRegistrationNumber: string
  taxRegistrationDocument: string
}

export type EmployeeRole = 'HR' | 'INTERVIEWER'

export interface Employee {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  role: EmployeeRole
  organizationId: string
}
