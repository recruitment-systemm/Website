import { z } from 'zod'
import { organizationPasswordField } from '@/organizations/validation/sharedOrganizationFields'

export const resetPasswordSchema = z
  .object({
    newPassword: organizationPasswordField,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
