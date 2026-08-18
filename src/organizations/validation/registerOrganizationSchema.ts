import { z } from 'zod'
import { organizationPasswordField, taxVerificationFields } from '@/organizations/validation/sharedOrganizationFields'

const companyDetailsFields = {
  name: z.string().trim().min(2, 'Enter your organization name').max(255),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(255),
  password: organizationPasswordField,
  confirmPassword: z.string().min(1, 'Confirm your password'),
}

export const registerOrganizationSchema = z
  .object({ ...companyDetailsFields, ...taxVerificationFields })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.taxRegistrationDocument !== undefined, {
    message: 'Upload your tax registration document',
    path: ['taxRegistrationDocument'],
  })

export type RegisterOrganizationFormValues = z.infer<typeof registerOrganizationSchema>

export const companyDetailsFieldNames = [
  'name',
  'email',
  'password',
  'confirmPassword',
] as const satisfies readonly (keyof RegisterOrganizationFormValues)[]
