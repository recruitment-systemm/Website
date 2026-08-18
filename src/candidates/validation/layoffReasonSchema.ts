import { z } from 'zod'

export const LAYOFF_REASON_CATEGORIES = [
  'Position eliminated',
  'Restructuring',
  'Budget cuts',
  'Performance',
  'Other',
] as const

export const layoffReasonSchema = z.object({
  category: z.enum(LAYOFF_REASON_CATEGORIES, { message: 'Choose a reason' }),
  details: z.string().trim().max(1000).optional(),
  effectiveDate: z.string().min(1, 'Pick an effective date'),
})

export type LayoffReasonFormValues = z.infer<typeof layoffReasonSchema>
