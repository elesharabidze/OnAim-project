import { z } from 'zod'

export const leaderboardPrizeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Prize name is required'),
  type: z.enum(['coins', 'freeSpin', 'bonus']),
  amount: z
    .number({ error: 'Amount must be a number' })
    .positive('Amount must be positive'),
  imageUrl: z.string().url('Must be a valid URL').or(z.literal('')),
})

export const leaderboardFormSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be at most 100 characters'),
    description: z.string(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    status: z.enum(['draft', 'active', 'completed']),
    scoringType: z.enum(['points', 'wins', 'wagered']),
    maxParticipants: z
      .number({ error: 'Must be a number' })
      .int('Must be a whole number')
      .min(2, 'Must have at least 2 participants'),
    prizes: z.array(leaderboardPrizeSchema).min(1, 'At least 1 prize is required'),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  })

export type LeaderboardFormValues = z.infer<typeof leaderboardFormSchema>
export type LeaderboardPrizeFormValues = z.infer<typeof leaderboardPrizeSchema>
