import { z } from 'zod'

const MAX_FILE_SIZE_MB = 10
// Matches Application-Interview-Services' CloudinaryService.ALLOWED_CONTENT_TYPES
// exactly — legacy .doc (application/msword) is NOT accepted server-side,
// only PDF and modern .docx. Accepting it here would let the form pass
// client validation and then fail with a 400 on submit.
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export const applyToJobSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Enter your first name').max(255),
    lastName: z.string().trim().min(1, 'Enter your last name').max(255),
    email: z.string().trim().min(1, 'Enter your email').email('Enter a valid email address'),
    phone: z
      .string()
      .trim()
      .regex(/^01[0125] \d{4} \d{4}$/, 'Enter a valid Egyptian phone number, e.g. 010 1234 5678')
      .optional()
      .or(z.literal('')),
    cv: z
      .instanceof(File, { message: 'Upload your CV' })
      .refine((file) => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024, {
        message: `File must be under ${MAX_FILE_SIZE_MB}MB`,
      })
      .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
        message: 'Accepted formats: PDF, DOCX',
      })
      .optional(),
  })
  .refine((data) => data.cv !== undefined, {
    message: 'Upload your CV',
    path: ['cv'],
  })

export type ApplyToJobFormValues = z.infer<typeof applyToJobSchema>
