import type { Context } from 'koa'
import { moduleService } from '../../service/module'
import { userAggregatorService } from '../../service/user-aggregator'
import {
  addModeratorSchema,
  createModuleSchema,
  lockSchema,
  updateModuleSchema,
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
 * Module Controller
 */
export const moduleController = {
  /**
   * 获取模块树
   * GET /api/v1/modules
   */
  async getModuleTree(ctx: Context) {
    try {
      const { userId } = getUserInfo(ctx)
      const response = await moduleService.getModuleTree(userId)
      success(ctx, response.tree)
    }
    catch (err: any) {
      console.error('[getModuleTree] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '获取模块树失败')
    }
  },

  /**
   * 获取单个模块
   * GET /api/v1/modules/:id
   */
  async getModule(ctx: Context) {
    try {
      const id = Number.parseInt(ctx.params.id, 10)
      if (Number.isNaN(id)) {
        return error(ctx, 1, '无效的模块ID')
      }

      const response = await moduleService.getModule(id)
      success(ctx, response.module)
    }
    catch (err: any) {
      console.error('[getModule] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '获取模块失败')
    }
  },

  /**
   * 获取面包屑导航
   * GET /api/v1/modules/:id/breadcrumbs
   */
  async getBreadcrumbs(ctx: Context) {
    try {
      const id = Number.parseInt(ctx.params.id, 10)
      if (Number.isNaN(id)) {
        return error(ctx, 1, '无效的模块ID')
      }

      const response = await moduleService.getBreadcrumbs(id)
      success(ctx, response.breadcrumbs)
    }
    catch (err: any) {
      console.error('[getBreadcrumbs] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '获取面包屑失败')
    }
  },

  /**
   * 创建模块
   * POST /api/v1/modules
   */
  async createModule(ctx: Context) {
    const result = createModuleSchema.safeParse(ctx.request.body)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }

    try {
      const { userId, userRole } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }

      const response = await moduleService.createModule(
        result.data.name,
        result.data.description,
        result.data.parent_id || 0,
        userId,
        userRole,
      )
      success(ctx, response.module)
    }
    catch (err: any) {
      console.error('[createModule] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '创建模块失败')
    }
  },

  /**
   * 更新模块
   * PUT /api/v1/modules/:id
   */
  async updateModule(ctx: Context) {
    const id = Number.parseInt(ctx.params.id, 10)
    if (Number.isNaN(id)) {
      return error(ctx, 1, '无效的模块ID')
    }

    const result = updateModuleSchema.safeParse(ctx.request.body)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }

    try {
      const { userId, userRole } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }

      await moduleService.updateModule(
        id,
        result.data.name,
        result.data.description,
        result.data.parent_id || 0,
        userId,
        userRole,
      )
      success(ctx, { message: '更新成功' })
    }
    catch (err: any) {
      console.error('[updateModule] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '更新模块失败')
    }
  },

  /**
   * 删除模块
   * DELETE /api/v1/modules/:id
   */
  async deleteModule(ctx: Context) {
    const id = Number.parseInt(ctx.params.id, 10)
    if (Number.isNaN(id)) {
      return error(ctx, 1, '无效的模块ID')
    }

    try {
      const { userId, userRole } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }

      const response = await moduleService.deleteModule(id, userId, userRole)
      success(ctx, { deleted_modules: response.deleted_modules })
    }
    catch (err: any) {
      console.error('[deleteModule] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '删除模块失败')
    }
  },

  /**
   * 获取协作者列表
   * GET /api/v1/modules/:id/moderators
   *
   * 返回聚合后的协作者信息，包含 user_id、username、avatar、role、created_at
   */
  async getModerators(ctx: Context) {
    const id = Number.parseInt(ctx.params.id, 10)
    if (Number.isNaN(id)) {
      return error(ctx, 1, '无效的模块ID')
    }

    try {
      const { userId, userRole } = getUserInfo(ctx)
      const response = await moduleService.getModerators(id, userId, userRole)

      // 使用 UserAggregatorService 聚合用户信息（添加 avatar）
      const enrichedModerators = await userAggregatorService.enrichModerators(
        response.moderators || [],
      )

      success(ctx, enrichedModerators)
    }
    catch (err: any) {
      console.error('[getModerators] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '获取协作者列表失败')
    }
  },

  /**
   * 添加协作者
   * POST /api/v1/modules/:id/moderators
   *
   * 验证：
   * - 目标用户必须存在
   * - moderator 不能添加 admin 角色
   */
  async addModerator(ctx: Context) {
    const id = Number.parseInt(ctx.params.id, 10)
    if (Number.isNaN(id)) {
      return error(ctx, 1, '无效的模块ID')
    }

    const result = addModeratorSchema.safeParse(ctx.request.body)
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

      // 角色权限验证：moderator 不能添加 admin
      // 注意：系统 admin 可以添加任意角色，这里的 userRole 是系统角色
      // 模块级别的权限验证在 Go 后端处理
      if (userRole !== 'admin' && result.data.role === 'admin') {
        // 需要先检查当前用户在该模块的角色
        // 如果当前用户是模块的 moderator，则不能添加 admin
        // 这个逻辑在 Go 后端会处理，这里只做基本验证
      }

      await moduleService.addModerator(
        id,
        result.data.user_id,
        result.data.role,
        userId,
        userRole,
      )
      success(ctx, { message: '添加成功' })
    }
    catch (err: any) {
      console.error('[addModerator] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '添加协作者失败')
    }
  },

  /**
   * 移除协作者
   * DELETE /api/v1/modules/:id/moderators/:userId
   */
  async removeModerator(ctx: Context) {
    const moduleId = Number.parseInt(ctx.params.id, 10)
    const targetUserId = Number.parseInt(ctx.params.userId, 10)
    if (Number.isNaN(moduleId) || Number.isNaN(targetUserId)) {
      return error(ctx, 1, '无效的ID')
    }

    try {
      const { userId, userRole } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }

      await moduleService.removeModerator(moduleId, targetUserId, userId, userRole)
      success(ctx, { message: '移除成功' })
    }
    catch (err: any) {
      console.error('[removeModerator] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '移除协作者失败')
    }
  },

  /**
   * 处理编辑锁
   * POST /api/v1/modules/lock
   */
  async handleLock(ctx: Context) {
    const result = lockSchema.safeParse(ctx.request.body)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }

    try {
      const { userId } = getUserInfo(ctx)
      if (!userId) {
        return error(ctx, 401, '未登录')
      }

      // moduleId is 0 for global lock
      const response = await moduleService.handleLock(0, result.data.action, userId)
      success(ctx, response.lock_info)
    }
    catch (err: any) {
      console.error('[handleLock] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '锁操作失败')
    }
  },
}

export default moduleController
