import type {
  AddModeratorResponse,
  CreateModuleRequest,
  CreateModuleResponse,
  DeleteModuleRequest,
  DeleteModuleResponse,
  GetBreadcrumbsRequest,
  GetBreadcrumbsResponse,
  GetModeratorsRequest,
  GetModeratorsResponse,
  GetModuleRequest,
  GetModuleResponse,
  GetModuleTreeRequest,
  GetModuleTreeResponse,
  AddModeratorRequest as GrpcAddModeratorRequest,
  HandleLockRequest,
  HandleLockResponse,
  RemoveModeratorRequest,
  RemoveModeratorResponse,
  UpdateModuleRequest,
  UpdateModuleResponse,
} from '../../protobuf/types/module_service'
import { getModuleClient } from '../wiki-grpc-client'

/**
 * Module Service - 封装 gRPC 调用
 */
export const moduleService = {
  /**
   * 获取模块树
   */
  async getModuleTree(userId: number = 0): Promise<GetModuleTreeResponse> {
    const req: GetModuleTreeRequest = { user_id: userId }
    return getModuleClient().GetModuleTree(req)
  },

  /**
   * 获取单个模块
   */
  async getModule(id: number): Promise<GetModuleResponse> {
    const req: GetModuleRequest = { id }
    return getModuleClient().GetModule(req)
  },

  /**
   * 获取面包屑导航
   */
  async getBreadcrumbs(moduleId: number): Promise<GetBreadcrumbsResponse> {
    const req: GetBreadcrumbsRequest = { module_id: moduleId }
    return getModuleClient().GetBreadcrumbs(req)
  },

  /**
   * 创建模块
   */
  async createModule(
    name: string,
    description: string,
    parentId: number,
    userId: number,
    userRole: string,
  ): Promise<CreateModuleResponse> {
    const req: CreateModuleRequest = {
      name,
      description,
      parent_id: parentId,
      user_id: userId,
      user_role: userRole,
    }
    return getModuleClient().CreateModule(req)
  },

  /**
   * 更新模块
   */
  async updateModule(
    id: number,
    name: string,
    description: string,
    parentId: number,
    userId: number,
    userRole: string,
  ): Promise<UpdateModuleResponse> {
    const req: UpdateModuleRequest = {
      id,
      name,
      description,
      parent_id: parentId,
      user_id: userId,
      user_role: userRole,
    }
    return getModuleClient().UpdateModule(req)
  },

  /**
   * 删除模块
   */
  async deleteModule(
    id: number,
    userId: number,
    userRole: string,
  ): Promise<DeleteModuleResponse> {
    const req: DeleteModuleRequest = {
      id,
      user_id: userId,
      user_role: userRole,
    }
    return getModuleClient().DeleteModule(req)
  },

  /**
   * 获取协作者列表
   */
  async getModerators(
    moduleId: number,
    userId: number,
    userRole: string,
  ): Promise<GetModeratorsResponse> {
    const req: GetModeratorsRequest = {
      module_id: moduleId,
      user_id: userId,
      user_role: userRole,
    }
    return getModuleClient().GetModerators(req)
  },

  /**
   * 添加协作者
   */
  async addModerator(
    moduleId: number,
    targetUserId: number,
    role: string,
    userId: number,
    userRole: string,
  ): Promise<AddModeratorResponse> {
    const req: GrpcAddModeratorRequest = {
      module_id: moduleId,
      target_user_id: targetUserId,
      role,
      user_id: userId,
      user_role: userRole,
    }
    return getModuleClient().AddModerator(req)
  },

  /**
   * 移除协作者
   */
  async removeModerator(
    moduleId: number,
    targetUserId: number,
    userId: number,
    userRole: string,
  ): Promise<RemoveModeratorResponse> {
    const req: RemoveModeratorRequest = {
      module_id: moduleId,
      target_user_id: targetUserId,
      user_id: userId,
      user_role: userRole,
    }
    return getModuleClient().RemoveModerator(req)
  },

  /**
   * 处理编辑锁
   */
  async handleLock(
    moduleId: number,
    action: string,
    userId: number,
  ): Promise<HandleLockResponse> {
    const req: HandleLockRequest = {
      module_id: moduleId,
      action,
      user_id: userId,
    }
    return getModuleClient().HandleLock(req)
  },
}

export default moduleService
