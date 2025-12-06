import type { Context } from 'koa'
import { moduleService } from '../../service/module'
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
   */
  async getModerators(ctx: Context) {
    const id = Number.parseInt(ctx.params.id, 10)
    if (Number.isNaN(id)) {
      return error(ctx, 1, '无效的模块ID')
    }

    try {
      const { userId, userRole } = getUserInfo(ctx)
      const response = await moduleService.getModerators(id, userId, userRole)
      success(ctx, response.moderators)
    }
    catch (err: any) {
      console.error('[getModerators] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '获取协作者列表失败')
    }
  },

  /**
   * 添加协作者
   * POST /api/v1/modules/:id/moderators
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
