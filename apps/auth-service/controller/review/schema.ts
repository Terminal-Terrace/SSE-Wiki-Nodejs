import { z } from 'zod'

/**
 * 审核操作请求
 */
export const reviewActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional().default(''),
  merged_content: z.string().optional().default(''),
})

export type ReviewActionRequest = z.infer<typeof reviewActionSchema>
