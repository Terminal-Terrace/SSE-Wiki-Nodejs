import { z } from 'zod'

/**
 * 创建模块请求
 */
export const createModuleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(512).optional(),
  parent_id: z.number().int().optional(),
})

export type CreateModuleRequest = z.infer<typeof createModuleSchema>

/**
 * 更新模块请求
 */
export const updateModuleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(512).optional(),
  parent_id: z.number().int().optional(),
})

export type UpdateModuleRequest = z.infer<typeof updateModuleSchema>

/**
 * 添加协作者请求
 */
export const addModeratorSchema = z.object({
  user_id: z.number().int().positive(),
  role: z.enum(['admin', 'moderator']),
})

export type AddModeratorRequest = z.infer<typeof addModeratorSchema>

/**
 * 编辑锁请求
 */
export const lockSchema = z.object({
  action: z.enum(['acquire', 'release']),
})

export type LockRequest = z.infer<typeof lockSchema>
