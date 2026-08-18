import { z } from 'zod'

export const employeeLoginSchema = z.object({
  email: z.string().trim().min(1, 'Work email is required').email('Enter a valid email address'),
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export type EmployeeLoginFormValues = z.infer<typeof employeeLoginSchema>
