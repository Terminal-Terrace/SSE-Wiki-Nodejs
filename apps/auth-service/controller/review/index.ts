import type { Context } from 'koa'
import { reviewService } from '../../service/review'
import { userAggregatorService } from '../../service/user-aggregator'
import { createMetadataFromContext } from '../../utils/grpc-metadata'
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

      const metadata = createMetadataFromContext(ctx)
      const response = await reviewService.getReviews(status, articleId, metadata)

      // 聚合提交者和审核者信息
      const enrichedSubmissions = await userAggregatorService.enrichArray(response.submissions || [], {
        fields: { submitted_by: 'submitter', reviewed_by: 'reviewer' },
      })

      success(ctx, enrichedSubmissions)
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

      const metadata = createMetadataFromContext(ctx)
      const response = await reviewService.getReviewDetail(submissionId, metadata)

      // 聚合审核详情中的用户信息
      const detail = response.detail
      if (detail) {
        // 聚合 submission 的提交者和审核者
        const enrichedSubmission = detail.submission
          ? await userAggregatorService.enrichObject(detail.submission, {
              fields: { submitted_by: 'submitter', reviewed_by: 'reviewer' },
            })
          : null

        // 聚合版本的作者信息
        const versionConfig = { fields: { author_id: 'author' } }
        const enrichedProposedVersion = detail.proposed_version
          ? await userAggregatorService.enrichObject(detail.proposed_version, versionConfig)
          : null
        const enrichedBaseVersion = detail.base_version
          ? await userAggregatorService.enrichObject(detail.base_version, versionConfig)
          : null
        const enrichedCurrentVersion = detail.current_version
          ? await userAggregatorService.enrichObject(detail.current_version, versionConfig)
          : null

        // 聚合文章的作者信息
        const enrichedArticle = detail.article
          ? await userAggregatorService.enrichObject(detail.article, {
              fields: { created_by: 'author' },
            })
          : null

        // 处理 conflict_data，填充 submitter_name
        let enrichedConflictData = detail.conflict_data || null
        if (enrichedConflictData && enrichedSubmission?.submitter) {
          enrichedConflictData = {
            ...enrichedConflictData,
            submitter_name: enrichedSubmission.submitter.username || enrichedSubmission.submitter.name || '',
          }
        }

        success(ctx, {
          submission: enrichedSubmission,
          proposed_version: enrichedProposedVersion,
          base_version: enrichedBaseVersion,
          current_version: enrichedCurrentVersion,
          article: enrichedArticle,
          conflict_data: enrichedConflictData,
        })
      }
      else {
        success(ctx, null)
      }
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
      const { userId } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }

      const metadata = createMetadataFromContext(ctx)
      const response = await reviewService.reviewAction(
        submissionId,
        result.data.action,
        result.data.notes,
        result.data.merged_content,
        metadata,
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
