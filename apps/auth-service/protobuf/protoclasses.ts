import type { RpcClientConfig } from '@sse-wiki/rpc-client'
import type * as AuthServiceTypes from './types/authservice'
import type * as ModuleServiceTypes from './types/ssewiki'
import path from 'node:path'
import { RpcClient } from '@sse-wiki/rpc-client'

/**
 * 服务客户端配置
 */
export interface ServiceConfig {
  serverAddress?: string
  /** 其他 RpcClient 配置 */
  rpcConfig?: Partial<Omit<RpcClientConfig, 'protoPath' | 'packageName' | 'serviceClassName' | 'serverAddress'>>
}

/**
 * AuthService 客户端
 *
 * 使用示例：
 * ```typescript
 * const client = new AuthService()
 * const response = await client.GetUser({ id: 123 })
 * ```
 */
export class AuthService {
  private rpcClient: RpcClient

  /**
   * 创建 AuthService 客户端
   * @param config 可选配置
   */
  constructor(config?: ServiceConfig) {
    const protoPath = path.join(import.meta.dirname, 'proto', 'authservice', 'authservice.proto')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: 'authservice',
      serviceClassName: 'AuthService',
      serverAddress: config?.serverAddress || 'localhost:50051',
      ...config?.rpcConfig,
    })
  }

  async Prelogin(req: AuthServiceTypes.PreloginRequest): Promise<AuthServiceTypes.PreloginResponse> {
    return this.rpcClient.call<AuthServiceTypes.PreloginRequest, AuthServiceTypes.PreloginResponse>('Prelogin', req)
  }

  async SendCode(req: AuthServiceTypes.CodeRequest): Promise<AuthServiceTypes.CodeResponse> {
    return this.rpcClient.call<AuthServiceTypes.CodeRequest, AuthServiceTypes.CodeResponse>('SendCode', req)
  }

  async Login(req: AuthServiceTypes.LoginRequest): Promise<AuthServiceTypes.LoginResponse> {
    return this.rpcClient.call<AuthServiceTypes.LoginRequest, AuthServiceTypes.LoginResponse>('Login', req)
  }

  async Logout(req: AuthServiceTypes.LogoutRequest): Promise<AuthServiceTypes.LogoutResponse> {
    return this.rpcClient.call<AuthServiceTypes.LogoutRequest, AuthServiceTypes.LogoutResponse>('Logout', req)
  }

  async GetUserInfo(req: AuthServiceTypes.InfoRequest): Promise<AuthServiceTypes.InfoResponse> {
    return this.rpcClient.call<AuthServiceTypes.InfoRequest, AuthServiceTypes.InfoResponse>('GetUserInfo', req)
  }

  async RefreshToken(req: AuthServiceTypes.RefreshRequest): Promise<AuthServiceTypes.RefreshResponse> {
    return this.rpcClient.call<AuthServiceTypes.RefreshRequest, AuthServiceTypes.RefreshResponse>('RefreshToken', req)
  }

  async Register(req: AuthServiceTypes.RegisterRequest): Promise<AuthServiceTypes.RegisterResponse> {
    return this.rpcClient.call<AuthServiceTypes.RegisterRequest, AuthServiceTypes.RegisterResponse>('Register', req)
  }

  /**
   * 关闭 gRPC 连接
   */
  close(): void {
    this.rpcClient.close()
  }

  /**
   * 等待连接就绪
   * @param deadline 超时时间（毫秒）
   */
  async waitForReady(deadline?: number): Promise<void> {
    return this.rpcClient.waitForReady(deadline)
  }
}

/**
 * ModuleService 客户端
 *
 * 使用示例：
 * ```typescript
 * const client = new ModuleService()
 * const response = await client.GetUser({ id: 123 })
 * ```
 */
export class ModuleService {
  private rpcClient: RpcClient

  /**
   * 创建 ModuleService 客户端
   * @param config 可选配置
   */
  constructor(config?: ServiceConfig) {
    const protoPath = path.join(import.meta.dirname, 'proto', 'ssewiki', 'ssewiki.proto')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: 'ssewiki',
      serviceClassName: 'ModuleService',
      serverAddress: config?.serverAddress || 'localhost:50051',
      ...config?.rpcConfig,
    })
  }

  async GetModuleTree(req: ModuleServiceTypes.GetModuleTreeRequest): Promise<ModuleServiceTypes.GetModuleTreeResponse> {
    return this.rpcClient.call<ModuleServiceTypes.GetModuleTreeRequest, ModuleServiceTypes.GetModuleTreeResponse>('GetModuleTree', req)
  }

  async GetModule(req: ModuleServiceTypes.GetModuleRequest): Promise<ModuleServiceTypes.GetModuleResponse> {
    return this.rpcClient.call<ModuleServiceTypes.GetModuleRequest, ModuleServiceTypes.GetModuleResponse>('GetModule', req)
  }

  async GetBreadcrumbs(req: ModuleServiceTypes.GetBreadcrumbsRequest): Promise<ModuleServiceTypes.GetBreadcrumbsResponse> {
    return this.rpcClient.call<ModuleServiceTypes.GetBreadcrumbsRequest, ModuleServiceTypes.GetBreadcrumbsResponse>('GetBreadcrumbs', req)
  }

  async CreateModule(req: ModuleServiceTypes.CreateModuleRequest): Promise<ModuleServiceTypes.CreateModuleResponse> {
    return this.rpcClient.call<ModuleServiceTypes.CreateModuleRequest, ModuleServiceTypes.CreateModuleResponse>('CreateModule', req)
  }

  async UpdateModule(req: ModuleServiceTypes.UpdateModuleRequest): Promise<ModuleServiceTypes.UpdateModuleResponse> {
    return this.rpcClient.call<ModuleServiceTypes.UpdateModuleRequest, ModuleServiceTypes.UpdateModuleResponse>('UpdateModule', req)
  }

  async DeleteModule(req: ModuleServiceTypes.DeleteModuleRequest): Promise<ModuleServiceTypes.DeleteModuleResponse> {
    return this.rpcClient.call<ModuleServiceTypes.DeleteModuleRequest, ModuleServiceTypes.DeleteModuleResponse>('DeleteModule', req)
  }

  async GetModerators(req: ModuleServiceTypes.GetModeratorsRequest): Promise<ModuleServiceTypes.GetModeratorsResponse> {
    return this.rpcClient.call<ModuleServiceTypes.GetModeratorsRequest, ModuleServiceTypes.GetModeratorsResponse>('GetModerators', req)
  }

  async AddModerator(req: ModuleServiceTypes.AddModeratorRequest): Promise<ModuleServiceTypes.AddModeratorResponse> {
    return this.rpcClient.call<ModuleServiceTypes.AddModeratorRequest, ModuleServiceTypes.AddModeratorResponse>('AddModerator', req)
  }

  async RemoveModerator(req: ModuleServiceTypes.RemoveModeratorRequest): Promise<ModuleServiceTypes.RemoveModeratorResponse> {
    return this.rpcClient.call<ModuleServiceTypes.RemoveModeratorRequest, ModuleServiceTypes.RemoveModeratorResponse>('RemoveModerator', req)
  }

  async HandleLock(req: ModuleServiceTypes.HandleLockRequest): Promise<ModuleServiceTypes.HandleLockResponse> {
    return this.rpcClient.call<ModuleServiceTypes.HandleLockRequest, ModuleServiceTypes.HandleLockResponse>('HandleLock', req)
  }

  /**
   * 关闭 gRPC 连接
   */
  close(): void {
    this.rpcClient.close()
  }

  /**
   * 等待连接就绪
   * @param deadline 超时时间（毫秒）
   */
  async waitForReady(deadline?: number): Promise<void> {
    return this.rpcClient.waitForReady(deadline)
  }
}
