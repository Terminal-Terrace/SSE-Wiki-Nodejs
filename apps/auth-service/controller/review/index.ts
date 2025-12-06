import type { Context } from 'koa'
import { reviewService } from '../../service/review'
import { reviewActionSchema } from './schema'

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
 * Review Controller
 */
export const reviewController = {
  /**
   * 获取审核列表
   * GET /api/v1/reviews
   */
  async getReviews(ctx: Context) {
    try {
      const status = (ctx.query.status as string) || ''
      const articleId = Number.parseInt(ctx.query.article_id as string, 10) || 0

      const response = await reviewService.getReviews(status, articleId)
      success(ctx, response.submissions)
    }
    catch (err: any) {
      console.error('[getReviews] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '获取审核列表失败')
    }
  },

  /**
   * 获取审核详情
   * GET /api/v1/reviews/:id
   */
  async getReviewDetail(ctx: Context) {
    try {
      const submissionId = Number.parseInt(ctx.params.id, 10)
      if (Number.isNaN(submissionId)) {
        return error(ctx, 1, '无效的提交ID')
      }

      const { userId, userRole } = getUserInfo(ctx)
      const response = await reviewService.getReviewDetail(submissionId, userId, userRole)
      success(ctx, response.detail)
    }
    catch (err: any) {
      console.error('[getReviewDetail] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '获取审核详情失败')
    }
  },

  /**
   * 执行审核操作
   * POST /api/v1/reviews/:id/action
   */
  async reviewAction(ctx: Context) {
    const submissionId = Number.parseInt(ctx.params.id, 10)
    if (Number.isNaN(submissionId)) {
      return error(ctx, 1, '无效的提交ID')
    }

    const result = reviewActionSchema.safeParse(ctx.request.body)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }

    try {
      const { userId, userRole } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }

      const response = await reviewService.reviewAction(
        submissionId,
        result.data.action,
        result.data.notes,
        result.data.merged_content,
        userId,
        userRole,
      )

      // Handle conflict response
      if (response.conflict_data?.has_conflict) {
        ctx.status = 409
        ctx.body = {
          code: 40900,
          message: '合并冲突',
          data: response.conflict_data,
        }
        return
      }

      success(ctx, {
        message: response.message,
        published_version: response.published_version,
      })
    }
    catch (err: any) {
      console.error('[reviewAction] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '审核操作失败')
    }
  },
}

export default reviewController
