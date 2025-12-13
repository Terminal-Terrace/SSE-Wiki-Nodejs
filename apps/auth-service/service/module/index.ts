import type { Metadata } from '@sse-wiki/rpc-client'
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
 * 用户信息通过 JWT metadata 传递
 */
export const moduleService = {
  /**
   * 获取模块树
   */
  async getModuleTree(metadata?: Metadata): Promise<GetModuleTreeResponse> {
    const req: GetModuleTreeRequest = {}
    return getModuleClient().GetModuleTree(req, metadata)
  },

  /**
   * 获取单个模块
   */
  async getModule(id: number, metadata?: Metadata): Promise<GetModuleResponse> {
    const req: GetModuleRequest = { id }
    return getModuleClient().GetModule(req, metadata)
  },

  /**
   * 获取面包屑导航
   */
  async getBreadcrumbs(moduleId: number, metadata?: Metadata): Promise<GetBreadcrumbsResponse> {
    const req: GetBreadcrumbsRequest = { module_id: moduleId }
    return getModuleClient().GetBreadcrumbs(req, metadata)
  },

  /**
   * 创建模块
   */
  async createModule(
    name: string,
    description: string,
    parentId: number,
    metadata?: Metadata,
  ): Promise<CreateModuleResponse> {
    const req: CreateModuleRequest = {
      name,
      description,
      parent_id: parentId,
    }
    return getModuleClient().CreateModule(req, metadata)
  },

  /**
   * 更新模块
   */
  async updateModule(
    id: number,
    name: string,
    description: string,
    parentId: number,
    metadata?: Metadata,
  ): Promise<UpdateModuleResponse> {
    const req: UpdateModuleRequest = {
      id,
      name,
      description,
      parent_id: parentId,
    }
    return getModuleClient().UpdateModule(req, metadata)
  },

  /**
   * 删除模块
   */
  async deleteModule(
    id: number,
    metadata?: Metadata,
  ): Promise<DeleteModuleResponse> {
    const req: DeleteModuleRequest = { id }
    return getModuleClient().DeleteModule(req, metadata)
  },

  /**
   * 获取协作者列表
   */
  async getModerators(
    moduleId: number,
    metadata?: Metadata,
  ): Promise<GetModeratorsResponse> {
    const req: GetModeratorsRequest = { module_id: moduleId }
    return getModuleClient().GetModerators(req, metadata)
  },

  /**
   * 添加协作者
   */
  async addModerator(
    moduleId: number,
    targetUserId: number,
    role: string,
    metadata?: Metadata,
  ): Promise<AddModeratorResponse> {
    const req: GrpcAddModeratorRequest = {
      module_id: moduleId,
      target_user_id: targetUserId,
      role,
    }
    return getModuleClient().AddModerator(req, metadata)
  },

  /**
   * 移除协作者
   */
  async removeModerator(
    moduleId: number,
    targetUserId: number,
    metadata?: Metadata,
  ): Promise<RemoveModeratorResponse> {
    const req: RemoveModeratorRequest = {
      module_id: moduleId,
      target_user_id: targetUserId,
    }
    return getModuleClient().RemoveModerator(req, metadata)
  },

  /**
   * 处理编辑锁
   */
  async handleLock(
    moduleId: number,
    action: string,
    metadata?: Metadata,
  ): Promise<HandleLockResponse> {
    const req: HandleLockRequest = {
      module_id: moduleId,
      action,
    }
    return getModuleClient().HandleLock(req, metadata)
  },
}

export default moduleService
