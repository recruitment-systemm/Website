import { z } from 'zod'

export const createJobSchema = z
  .object({
    title: z.string().trim().min(2, 'Enter a job title').max(255),
    description: z
      .string()
      .trim()
      .min(10, 'Enter a description (at least 10 characters)')
      .max(5000),
    address: z.string().trim().min(2, 'Enter a location').max(255),
    latitude: z
      .number()
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90')
      .optional(),
    longitude: z
      .number()
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180')
      .optional(),
  })
  .refine((data) => data.latitude !== undefined, {
    message: 'Enter a latitude between -90 and 90',
    path: ['latitude'],
  })
  .refine((data) => data.longitude !== undefined, {
    message: 'Enter a longitude between -180 and 180',
    path: ['longitude'],
  })

export type CreateJobFormValues = z.infer<typeof createJobSchema>
