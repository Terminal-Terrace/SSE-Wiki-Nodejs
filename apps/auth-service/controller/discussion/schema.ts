import { z } from 'zod'

/**
 * 创建评论请求
 */
export const createCommentSchema = z.object({
  content: z.string().min(1, '评论内容不能为空'),
})

export type CreateCommentRequest = z.infer<typeof createCommentSchema>

/**
 * 回复评论请求
 */
export const replyCommentSchema = z.object({
  content: z.string().min(1, '回复内容不能为空'),
})

export type ReplyCommentRequest = z.infer<typeof replyCommentSchema>

/**
 * 更新评论请求
 */
export const updateCommentSchema = z.object({
  content: z.string().min(1, '评论内容不能为空'),
})

export type UpdateCommentRequest = z.infer<typeof updateCommentSchema>
