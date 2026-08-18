import { z } from 'zod'

const MAX_FILE_SIZE_MB = 10
// Matches authentication-service's own CloudinaryService.ALLOWED_CONTENT_TYPES
// exactly — PDF and modern .docx only. No image formats are accepted
// server-side despite this being framed as a "document" upload.
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

// Matches CreateOrganizationRequest.password's regex exactly (also used by
// CompleteLinkedInSignupRequest.password — same rule on both signup paths)
// — the backend rejects anything weaker with a 400, so this needs to catch
// it before the form ever submits.
export const organizationPasswordField = z
  .string()
  .min(8, 'Must be at least 8 characters')
  .regex(/[a-z]/, 'Must include at least one lowercase letter')
  .regex(/[A-Z]/, 'Must include at least one uppercase letter')
  .regex(/\d/, 'Must include at least one number')
  .regex(/[@#$%!]/, 'Must include at least one special character (@ # $ % !)')

export const taxVerificationFields = {
  taxRegistrationNumber: z
    .string()
    .trim()
    .regex(/^EG-\d{3}-\d{3}-\d{3}$/, 'Enter a 9-digit tax registration number'),
  taxRegistrationDocument: z
    .instanceof(File, { message: 'Upload your tax registration document' })
    .refine((file) => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024, {
      message: `File must be under ${MAX_FILE_SIZE_MB}MB`,
    })
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
      message: 'Accepted formats: PDF, DOCX',
    })
    .optional(),
}
