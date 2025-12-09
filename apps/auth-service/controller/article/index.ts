import type { Context } from 'koa'
import { articleService } from '../../service/article'
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
      success(ctx, {
        total: response.total,
        page: response.page,
        page_size: response.page_size,
        articles: response.articles,
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
      const { userId } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }
      const rep = await articleService.updateUserFavouriteArticles(
        userId,
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
   * 获取文章详情
   * GET /api/v1/articles/user-favour/:id
   */
  async getUserFavourArticle(ctx: Context) {
    try {
      const userId = String(ctx.params.id)

      const articleLikeResp = await articleService.getUserFavourArticles(userId)
      const articleIds = articleLikeResp.id

      if (articleIds.length === 0) {
        return success(ctx, [])
      }

      const UserNumId = Number.parseInt(userId, 10)

      if (Number.isNaN(UserNumId)) {
        return error(ctx, 1, '无效的用户ID')
      }
      const { userRole } = getUserInfo(ctx)

      const articlePromises = articleIds.map(articleId =>
        articleService.getArticle(articleId, UserNumId, userRole),
      )

      const articles = await Promise.all(articlePromises)
      success(ctx, {
        articles,
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
      success(ctx, response.article)
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
      success(ctx, response.versions)
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
      success(ctx, response.version)
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
      // 返回 base_version 和 current_version 对象
      success(ctx, {
        base_version: response.base_version || null,
        current_version: response.current_version,
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
   * 添加协作者
   * POST /api/v1/articles/:id/collaborators
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
}

export default articleController
