import { z } from 'zod'

/**
 * 搜索用户请求参数
 */
export const searchUsersSchema = z.object({
  keyword: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  page_size: z.coerce.number().int().min(1).max(100).optional().default(10),
})

export type SearchUsersQuery = z.infer<typeof searchUsersSchema>
