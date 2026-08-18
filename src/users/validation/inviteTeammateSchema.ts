import { z } from 'zod'
import type { UserRole } from '@/users/types/user'

const ROLES: [UserRole, ...UserRole[]] = ['HR', 'INTERVIEWER']

export const inviteTeammateSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Enter a username (at least 3 characters)')
    .max(100)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Letters, numbers, and . _ - only'),
  firstName: z.string().trim().min(2, 'Enter a first name').max(100),
  lastName: z.string().trim().min(2, 'Enter a last name').max(100),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address').max(255),
  // The backend (CreateEmployeeRequest.password) only requires non-blank —
  // employee credentials are stored in LDAP, not BCrypt-hashed here, so
  // there's no server-side strength regex to match. This minimum is a
  // frontend-only UX choice, not a backend contract.
  password: z
    .string()
    .min(8, 'Must be at least 8 characters')
    .regex(/\d/, 'Must include at least one number'),
  role: z.enum(ROLES, { message: 'Choose a role' }),
})

export type InviteTeammateFormValues = z.infer<typeof inviteTeammateSchema>
