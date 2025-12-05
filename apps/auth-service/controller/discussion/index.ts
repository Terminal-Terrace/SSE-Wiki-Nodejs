import type { Context } from 'koa'
import { discussionService } from '../../service/discussion'
import { createCommentSchema, replyCommentSchema, updateCommentSchema } from './schema'

/**
 * 统一响应格式 (与 Go 服务保持一致)
 */
function success(ctx: Context, data: unknown = null) {
  ctx.body = {
    code: 100,
    message: '',
    data,
  }
}

function error(ctx: Context, code: number, message: string) {
  ctx.body = {
    code,
    message,
    data: null,
  }
}

/**
 * 从上下文获取用户信息
 */
function getUserInfo(ctx: Context): { userId: number, userRole: string } {
  const userId = ctx.state.user?.user_id ? Number.parseInt(ctx.state.user.user_id, 10) : 0
  const userRole = ctx.state.user?.role || ''
  return { userId, userRole }
}

/**
 * Discussion Controller
 */
export const discussionController = {
  /**
   * 获取文章评论列表
   * GET /api/v1/articles/:id/discussions
   */
  async getArticleComments(ctx: Context) {
    try {
      const articleId = Number.parseInt(ctx.params.id, 10)
      if (Number.isNaN(articleId)) {
        return error(ctx, 1, '无效的文章ID')
      }

      const response = await discussionService.getArticleComments(articleId)
      success(ctx, {
        comments: response.comments,
        total: response.total,
      })
    }
    catch (err: any) {
      console.error('[getArticleComments] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '获取评论列表失败')
    }
  },

  /**
   * 创建评论
   * POST /api/v1/articles/:id/discussions
   */
  async createComment(ctx: Context) {
    const articleId = Number.parseInt(ctx.params.id, 10)
    if (Number.isNaN(articleId)) {
      return error(ctx, 1, '无效的文章ID')
    }

    const result = createCommentSchema.safeParse(ctx.request.body)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }

    try {
      const { userId } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }

      const response = await discussionService.createComment(
        articleId,
        result.data.content,
        userId,
      )
      success(ctx, response.comment)
    }
    catch (err: any) {
      console.error('[createComment] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '创建评论失败')
    }
  },

  /**
   * 回复评论
   * POST /api/v1/comments/:id/replies
   */
  async replyComment(ctx: Context) {
    const commentId = Number.parseInt(ctx.params.id, 10)
    if (Number.isNaN(commentId)) {
      return error(ctx, 1, '无效的评论ID')
    }

    const result = replyCommentSchema.safeParse(ctx.request.body)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }

    try {
      const { userId } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }

      const response = await discussionService.replyComment(
        commentId,
        result.data.content,
        userId,
      )
      success(ctx, response.comment)
    }
    catch (err: any) {
      console.error('[replyComment] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '回复评论失败')
    }
  },

  /**
   * 更新评论
   * PUT /api/v1/comments/:id
   */
  async updateComment(ctx: Context) {
    const commentId = Number.parseInt(ctx.params.id, 10)
    if (Number.isNaN(commentId)) {
      return error(ctx, 1, '无效的评论ID')
    }

    const result = updateCommentSchema.safeParse(ctx.request.body)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }

    try {
      const { userId } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }

      const response = await discussionService.updateComment(
        commentId,
        result.data.content,
        userId,
      )
      success(ctx, response.comment)
    }
    catch (err: any) {
      console.error('[updateComment] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '更新评论失败')
    }
  },

  /**
   * 删除评论
   * DELETE /api/v1/comments/:id
   */
  async deleteComment(ctx: Context) {
    const commentId = Number.parseInt(ctx.params.id, 10)
    if (Number.isNaN(commentId)) {
      return error(ctx, 1, '无效的评论ID')
    }

    try {
      const { userId } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }

      await discussionService.deleteComment(commentId, userId)
      success(ctx, { message: '删除成功' })
    }
    catch (err: any) {
      console.error('[deleteComment] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '删除评论失败')
    }
  },
}

export default discussionController
