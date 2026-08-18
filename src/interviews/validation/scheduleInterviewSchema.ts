import { z } from 'zod'

export const scheduleInterviewSchema = z.object({
  scheduledAt: z
    .string()
    .min(1, 'Pick a date and time')
    .refine((value) => new Date(value).getTime() > Date.now(), {
      message: 'Pick a time in the future',
    }),
})

export type ScheduleInterviewFormValues = z.infer<typeof scheduleInterviewSchema>
