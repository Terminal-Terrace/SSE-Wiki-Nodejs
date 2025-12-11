import type { Context } from 'koa'
import { userAggregatorService } from '../../service/user-aggregator'
import { searchUsersSchema } from './schema'

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
 * User Controller - 用户相关接口
 */
export const userController = {
  /**
   * 搜索用户
   * GET /api/v1/users/search
   *
   * Query params:
   * - keyword: 搜索关键词（用户名模糊匹配）
   * - page: 页码，从1开始，默认1
   * - page_size: 每页数量，默认10，最大100
   *
   * 返回 PublicUserInfo（不含 email）
   */
  async searchUsers(ctx: Context) {
    // 获取当前用户ID（用于排除自己）
    const currentUserId = ctx.state.user?.user_id
      ? Number(ctx.state.user.user_id)
      : 0

    // 验证查询参数
    const result = searchUsersSchema.safeParse(ctx.query)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }

    const { keyword, page, page_size } = result.data

    // 空关键词直接返回空列表
    if (!keyword || keyword.trim() === '') {
      return success(ctx, {
        users: [],
        total: 0,
        page: page || 1,
        page_size: page_size || 10,
      })
    }

    try {
      const response = await userAggregatorService.searchUsers(
        keyword,
        currentUserId,
        page || 1,
        page_size || 10,
      )

      success(ctx, {
        users: response.users,
        total: response.total,
        page: page || 1,
        page_size: page_size || 10,
      })
    }
    catch (err: any) {
      console.error('[searchUsers] error:', err)
      error(ctx, 0, err.details || err.message || '搜索用户失败')
    }
  },

  /**
   * 获取用户公开信息
   * GET /api/v1/users/:id
   *
   * 返回 PublicUserInfo（不含 email）
   */
  async getUserById(ctx: Context) {
    const userId = Number(ctx.params.id)
    if (!userId || Number.isNaN(userId)) {
      return error(ctx, 1, '无效的用户ID')
    }

    try {
      const user = await userAggregatorService.getUserById(userId)
      if (!user) {
        return error(ctx, 404, '用户不存在')
      }

      success(ctx, user)
    }
    catch (err: any) {
      console.error('[getUserById] error:', err)
      error(ctx, 0, err.details || err.message || '获取用户信息失败')
    }
  },
}

export default userController
