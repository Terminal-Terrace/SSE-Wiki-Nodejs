import { z } from 'zod'

/**
 * 创建文章请求
 */
export const createArticleSchema = z.object({
  title: z.string().min(1).max(255),
  module_id: z.number().int().positive(),
  content: z.string().min(1),
  commit_message: z.string().min(1).max(255),
  is_review_required: z.boolean().optional(),
  tags: z.array(z.string()).optional().default([]),
})

export type CreateArticleRequest = z.infer<typeof createArticleSchema>

/**
 * 更新用户收藏请求
 */
export const updateUserFavouriteSchema = z.object({
  article_id: z.number().int().positive(),
  is_added: z.boolean(),
})

export type UpdateUserFavouriteRequest = z.infer<typeof updateUserFavouriteSchema>

/**
 * 提交修改请求
 */
export const submissionSchema = z.object({
  content: z.string().min(1),
  commit_message: z.string().min(1).max(255),
  base_version_id: z.number().int().positive(),
})

export type SubmissionRequest = z.infer<typeof submissionSchema>

/**
 * 更新文章基础信息请求
 */
export const updateBasicInfoSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  tags: z.array(z.string()).optional(),
  is_review_required: z.boolean().optional(),
})

export type UpdateBasicInfoRequest = z.infer<typeof updateBasicInfoSchema>

/**
 * 添加协作者请求
 */
export const addCollaboratorSchema = z.object({
  user_id: z.number().int().positive(),
  role: z.enum(['owner', 'moderator']),
})

export type AddCollaboratorRequest = z.infer<typeof addCollaboratorSchema>
