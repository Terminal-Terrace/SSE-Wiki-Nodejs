import type { RpcClientConfig } from '@sse-wiki/rpc-client'
import type * as Types from './types/authservice'
import path from 'node:path'
import { RpcClient } from './types/authservice'

/**
 * AuthService 客户端配置
 */
export interface AuthServiceConfig {
  /** gRPC 服务器地址，默认为 'localhost:50051' */
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
  constructor(config?: AuthServiceConfig) {
    const protoPath = path.join(__dirname, 'authservice', 'authservice.proto')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: 'authservice',
      serviceClassName: 'AuthService',
      serverAddress: config?.serverAddress || 'localhost:50051',
      ...config?.rpcConfig,
    })
  }

  async SendCode(req: Types.CodeRequest): Promise<Types.CodeResponse> {
    return this.rpcClient.call<Types.CodeRequest, Types.CodeResponse>('SendCode', req)
  }

  async Login(req: Types.LoginRequest): Promise<Types.LoginResponse> {
    return this.rpcClient.call<Types.LoginRequest, Types.LoginResponse>('Login', req)
  }

  async Logout(req: Types.LogoutRequest): Promise<Types.LogoutResponse> {
    return this.rpcClient.call<Types.LogoutRequest, Types.LogoutResponse>('Logout', req)
  }

  async GetUserInfo(req: Types.InfoRequest): Promise<Types.InfoResponse> {
    return this.rpcClient.call<Types.InfoRequest, Types.InfoResponse>('GetUserInfo', req)
  }

  async RefreshToken(req: Types.RefreshRequest): Promise<Types.RefreshResponse> {
    return this.rpcClient.call<Types.RefreshRequest, Types.RefreshResponse>('RefreshToken', req)
  }

  async Register(req: Types.RegisterRequest): Promise<Types.RegisterResponse> {
    return this.rpcClient.call<Types.RegisterRequest, Types.RegisterResponse>('Register', req)
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
