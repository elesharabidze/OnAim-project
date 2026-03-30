import { z } from 'zod'

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

export const wheelSegmentSchema = z
  .object({
    id: z.string().optional(),
    label: z.string().min(1, 'Label is required'),
    color: z
      .string()
      .regex(hexColorRegex, 'Must be a valid hex color (e.g. #ff0000)'),
    weight: z
      .number()
      .int()
      .min(1, 'Weight must be at least 1')
      .max(100, 'Weight must be at most 100'),
    prizeType: z.enum(['coins', 'freeSpin', 'bonus', 'nothing']),
    prizeAmount: z.number().min(0),
    imageUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  })
  .refine(
    (seg) =>
      seg.prizeType === 'nothing' ? seg.prizeAmount === 0 : seg.prizeAmount > 0,
    {
      message:
        'Prize amount must be 0 for "nothing" and greater than 0 otherwise',
      path: ['prizeAmount'],
    }
  )

export const wheelFormSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(80, 'Name must be at most 80 characters'),
    description: z.string(),
    status: z.enum(['draft', 'active', 'inactive']),
    segments: z
      .array(wheelSegmentSchema)
      .min(2, 'Wheel must have at least 2 segments')
      .max(12, 'Wheel cannot have more than 12 segments'),
    maxSpinsPerUser: z.number().int().min(1, 'Must allow at least 1 spin'),
    spinCost: z.number().min(0, 'Spin cost must be non-negative'),
    backgroundColor: z
      .string()
      .regex(hexColorRegex, 'Must be a valid hex color'),
    borderColor: z.string().regex(hexColorRegex, 'Must be a valid hex color'),
  })
  .refine(
    (data) => {
      const total = data.segments.reduce((sum, s) => sum + s.weight, 0)
      return total === 100
    },
    {
      message: 'Segment weights must sum to exactly 100',
      path: ['segments'],
    }
  )

export type WheelFormValues = z.infer<typeof wheelFormSchema>
