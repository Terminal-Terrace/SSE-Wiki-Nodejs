import type { Context } from 'koa'
import { articleService } from '../../service/article'
import { userAggregatorService } from '../../service/user-aggregator'
import {
  addCollaboratorSchema,
  createArticleSchema,
  submissionSchema,
  updateBasicInfoSchema,
  updateUserFavouriteSchema,
} from './schema'

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
 * Article Controller
 */
export const articleController = {
  /**
   * 获取模块下的文章列表
   * GET /api/v1/modules/:id/articles
   */
  async getArticlesByModule(ctx: Context) {
    try {
      const moduleId = Number.parseInt(ctx.params.id, 10)
      if (Number.isNaN(moduleId)) {
        return error(ctx, 1, '无效的模块ID')
      }

      const page = Number.parseInt(ctx.query.page as string, 10) || 1
      const pageSize = Number.parseInt(ctx.query.pageSize as string, 10) || 20

      const response = await articleService.getArticlesByModule(moduleId, page, pageSize)

      // 聚合文章列表的作者信息
      const enrichedArticles = await userAggregatorService.enrichArray(response.articles || [], {
        fields: { created_by: 'author' },
      })

      success(ctx, {
        total: response.total,
        page: response.page,
        page_size: response.page_size,
        articles: enrichedArticles,
      })
    }
    catch (err: any) {
      console.error('[getArticlesByModule] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '获取文章列表失败')
    }
  },

  /**
   * 更新用户收藏文章
   * POST /api/v1/articles/update-user-favour
   */
  async updateUserFavouriteArticles(ctx: Context) {
    const result = updateUserFavouriteSchema.safeParse(ctx.request.body)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }
    try {
      // const { userId } = getUserInfo(ctx)
      // if (!userId) {
      //   return error(ctx, 401, '未登录')
      // }
      const rep = await articleService.updateUserFavouriteArticles(
        result.data.user_id,
        result.data.article_id,
        result.data.is_added,
      )
      success(ctx, rep.status)
    }
    catch (err: any) {
      console.error('[updateArticleFavourites] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '更新用户收藏失败')
    }
  },

  /**
   * 获取用户收藏的文章列表
   * GET /api/v1/articles/user-favour/:id
   */
  async getUserFavourArticle(ctx: Context) {
    try {
      const userId = String(ctx.params.id)

      const articleLikeResp = await articleService.getUserFavourArticles(userId)
      const articleIds = articleLikeResp.id

      if (articleIds.length === 0) {
        return success(ctx, { articles: [], article_id: [] })
      }

      const UserNumId = Number.parseInt(userId, 10)

      if (Number.isNaN(UserNumId)) {
        return error(ctx, 1, '无效的用户ID')
      }
      const { userRole } = getUserInfo(ctx)

      const articlePromises = articleIds.map(articleId =>
        articleService.getArticle(articleId, UserNumId, userRole),
      )

      const articlesResponses = await Promise.all(articlePromises)
      const articles = articlesResponses.map(r => r.article)

      // 聚合文章列表的作者信息
      const enrichedArticles = await userAggregatorService.enrichArray(articles, {
        fields: { created_by: 'author' },
      })

      success(ctx, {
        articles: enrichedArticles,
        article_id: articleIds,
      })
    }
    catch (err: any) {
      console.error('[getUserFavourArticle] gRPC error:', err)
      error(ctx, 0, err.details || err.message)
    }
  },

  /**
   * 获取文章详情
   * GET /api/v1/articles/:id
   */
  async getArticle(ctx: Context) {
    try {
      const id = Number.parseInt(ctx.params.id, 10)
      if (Number.isNaN(id)) {
        return error(ctx, 1, '无效的文章ID')
      }

      const { userId, userRole } = getUserInfo(ctx)
      const response = await articleService.getArticle(id, userId, userRole)
      const article = response.article as Record<string, any>

      // 收集所有需要聚合的用户 ID
      const userIds = new Set<number>()

      // 文章创建者
      if (article.created_by && article.created_by > 0) {
        userIds.add(article.created_by)
      }

      // history 中的 author_id 和 reviewed_by
      if (Array.isArray(article.history)) {
        for (const entry of article.history) {
          if (entry.author_id && entry.author_id > 0) {
            userIds.add(entry.author_id)
          }
          if (entry.reviewed_by && entry.reviewed_by > 0) {
            userIds.add(entry.reviewed_by)
          }
        }
      }

      // pending_submissions 中的 submitted_by
      if (Array.isArray(article.pending_submissions)) {
        for (const sub of article.pending_submissions) {
          if (sub.submitted_by && sub.submitted_by > 0) {
            userIds.add(sub.submitted_by)
          }
        }
      }

      // 批量获取用户信息
      const userMap = await userAggregatorService.getUsersByIds([...userIds])

      // 聚合文章作者
      const enrichedArticle = { ...article } as Record<string, any>
      if (article.created_by && article.created_by > 0) {
        enrichedArticle.author = userMap.get(article.created_by) || { id: article.created_by, username: '', avatar: '' }
      }

      // 聚合 history 中的用户信息
      if (Array.isArray(article.history)) {
        enrichedArticle.history = article.history.map((entry: any) => {
          const enrichedEntry = { ...entry }
          if (entry.author_id && entry.author_id > 0) {
            enrichedEntry.author = userMap.get(entry.author_id) || { id: entry.author_id, username: '', avatar: '' }
          }
          if (entry.reviewed_by && entry.reviewed_by > 0) {
            enrichedEntry.reviewer = userMap.get(entry.reviewed_by) || { id: entry.reviewed_by, username: '', avatar: '' }
          }
          return enrichedEntry
        })
      }

      // 聚合 pending_submissions 中的用户信息
      if (Array.isArray(article.pending_submissions)) {
        enrichedArticle.pending_submissions = article.pending_submissions.map((sub: any) => {
          const enrichedSub = { ...sub }
          if (sub.submitted_by && sub.submitted_by > 0) {
            enrichedSub.submitter = userMap.get(sub.submitted_by) || { id: sub.submitted_by, username: '', avatar: '' }
          }
          return enrichedSub
        })
      }

      success(ctx, enrichedArticle)
    }
    catch (err: any) {
      console.error('[getArticle] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '获取文章失败')
    }
  },

  /**
   * 获取文章版本列表
   * GET /api/v1/articles/:id/versions
   */
  async getVersions(ctx: Context) {
    try {
      const articleId = Number.parseInt(ctx.params.id, 10)
      if (Number.isNaN(articleId)) {
        return error(ctx, 1, '无效的文章ID')
      }

      const response = await articleService.getVersions(articleId)

      // 聚合版本列表的作者信息
      const enrichedVersions = await userAggregatorService.enrichArray(response.versions || [], {
        fields: { author_id: 'author' },
      })

      success(ctx, enrichedVersions)
    }
    catch (err: any) {
      console.error('[getVersions] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '获取版本列表失败')
    }
  },

  /**
   * 获取特定版本
   * GET /api/v1/versions/:id
   */
  async getVersion(ctx: Context) {
    try {
      const id = Number.parseInt(ctx.params.id, 10)
      if (Number.isNaN(id)) {
        return error(ctx, 1, '无效的版本ID')
      }

      const response = await articleService.getVersion(id)

      // 聚合版本的作者信息
      const enrichedVersion = await userAggregatorService.enrichObject(response.version, {
        fields: { author_id: 'author' },
      })

      success(ctx, enrichedVersion)
    }
    catch (err: any) {
      console.error('[getVersion] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '获取版本失败')
    }
  },

  /**
   * 获取版本diff
   * GET /api/v1/versions/:id/diff
   */
  async getVersionDiff(ctx: Context) {
    try {
      const id = Number.parseInt(ctx.params.id, 10)
      if (Number.isNaN(id)) {
        return error(ctx, 1, '无效的版本ID')
      }

      const response = await articleService.getVersionDiff(id)

      // 聚合两个版本的作者信息
      const enrichConfig = { fields: { author_id: 'author' } }
      const enrichedBaseVersion = response.base_version
        ? await userAggregatorService.enrichObject(response.base_version, enrichConfig)
        : null
      const enrichedCurrentVersion = await userAggregatorService.enrichObject(response.current_version, enrichConfig)

      success(ctx, {
        base_version: enrichedBaseVersion,
        current_version: enrichedCurrentVersion,
      })
    }
    catch (err: any) {
      console.error('[getVersionDiff] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '获取版本diff失败')
    }
  },

  /**
   * 创建文章
   * POST /api/v1/articles
   */
  async createArticle(ctx: Context) {
    const result = createArticleSchema.safeParse(ctx.request.body)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }

    try {
      const { userId } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }

      const response = await articleService.createArticle(
        result.data.title,
        result.data.module_id,
        result.data.content,
        result.data.commit_message,
        result.data.is_review_required ?? false,
        result.data.tags,
        userId,
      )
      success(ctx, response.article)
    }
    catch (err: any) {
      console.error('[createArticle] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '创建文章失败')
    }
  },

  /**
   * 创建提交
   * POST /api/v1/articles/:id/submissions
   */
  async createSubmission(ctx: Context) {
    const articleId = Number.parseInt(ctx.params.id, 10)
    if (Number.isNaN(articleId)) {
      return error(ctx, 1, '无效的文章ID')
    }

    const result = submissionSchema.safeParse(ctx.request.body)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }

    try {
      const { userId, userRole } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }

      const response = await articleService.createSubmission(
        articleId,
        result.data.content,
        result.data.commit_message,
        result.data.base_version_id,
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
        published: response.published,
        need_review: response.need_review,
        message: response.message,
        submission: response.submission,
        published_version: response.published_version,
      })
    }
    catch (err: any) {
      console.error('[createSubmission] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '创建提交失败')
    }
  },

  /**
   * 更新文章基础信息
   * PATCH /api/v1/articles/:id/basic-info
   */
  async updateBasicInfo(ctx: Context) {
    const articleId = Number.parseInt(ctx.params.id, 10)
    if (Number.isNaN(articleId)) {
      return error(ctx, 1, '无效的文章ID')
    }

    const result = updateBasicInfoSchema.safeParse(ctx.request.body)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }

    try {
      const { userId, userRole } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }

      await articleService.updateBasicInfo(articleId, userId, userRole, {
        title: result.data.title,
        tags: result.data.tags,
        isReviewRequired: result.data.is_review_required,
      })
      success(ctx, { message: '更新成功' })
    }
    catch (err: any) {
      console.error('[updateBasicInfo] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '更新基础信息失败')
    }
  },

  /**
   * 获取文章协作者列表
   * GET /api/v1/articles/:id/collaborators
   *
   * 返回聚合后的协作者信息，包含 user_id、username、avatar、role、created_at
   */
  async getCollaborators(ctx: Context) {
    const articleId = Number.parseInt(ctx.params.id, 10)
    if (Number.isNaN(articleId)) {
      return error(ctx, 1, '无效的文章ID')
    }

    try {
      const { userId, userRole } = getUserInfo(ctx)
      const response = await articleService.getCollaborators(articleId, userId, userRole)

      // 使用 UserAggregatorService 聚合用户信息（添加 avatar）
      const enrichedCollaborators = await userAggregatorService.enrichCollaborators(
        (response.collaborators || []).map(c => ({
          user_id: c.user_id,
          role: c.role,
          created_at: c.created_at,
        })),
      )

      success(ctx, enrichedCollaborators)
    }
    catch (err: any) {
      console.error('[getCollaborators] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '获取协作者列表失败')
    }
  },

  /**
   * 添加协作者
   * POST /api/v1/articles/:id/collaborators
   *
   * 验证：
   * - 目标用户必须存在
   * - moderator 不能添加 owner 角色
   */
  async addCollaborator(ctx: Context) {
    const articleId = Number.parseInt(ctx.params.id, 10)
    if (Number.isNaN(articleId)) {
      return error(ctx, 1, '无效的文章ID')
    }

    const result = addCollaboratorSchema.safeParse(ctx.request.body)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }

    try {
      const { userId, userRole } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }

      // 验证目标用户存在
      const targetUserExists = await userAggregatorService.userExists(result.data.user_id)
      if (!targetUserExists) {
        return error(ctx, 404, '目标用户不存在')
      }

      await articleService.addCollaborator(
        articleId,
        result.data.user_id,
        result.data.role,
        userId,
        userRole,
      )
      success(ctx, { message: '添加成功' })
    }
    catch (err: any) {
      console.error('[addCollaborator] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '添加协作者失败')
    }
  },

  /**
   * 移除协作者
   * DELETE /api/v1/articles/:id/collaborators/:userId
   */
  async removeCollaborator(ctx: Context) {
    const articleId = Number.parseInt(ctx.params.id, 10)
    const targetUserId = Number.parseInt(ctx.params.userId, 10)
    if (Number.isNaN(articleId) || Number.isNaN(targetUserId)) {
      return error(ctx, 1, '无效的ID')
    }

    try {
      const { userId, userRole } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }

      await articleService.removeCollaborator(articleId, targetUserId, userId, userRole)
      success(ctx, { message: '移除成功' })
    }
    catch (err: any) {
      console.error('[removeCollaborator] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '移除协作者失败')
    }
  },
}

export default articleController
