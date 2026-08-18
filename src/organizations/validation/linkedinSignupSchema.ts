import { z } from 'zod'
import { organizationPasswordField, taxVerificationFields } from '@/organizations/validation/sharedOrganizationFields'

export const linkedinSignupSchema = z
  .object({
    organizationName: z.string().trim().min(2, 'Enter your organization name').max(255),
    password: organizationPasswordField,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    ...taxVerificationFields,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.taxRegistrationDocument !== undefined, {
    message: 'Upload your tax registration document',
    path: ['taxRegistrationDocument'],
  })

export type LinkedInSignupFormValues = z.infer<typeof linkedinSignupSchema>
