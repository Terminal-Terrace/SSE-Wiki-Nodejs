import type { LoginRequest, RegisterRequest, SendCodeRequest } from '../../controller/auth/schema'
import type {
  CodeRequest,
  CodeResponse,
  CodeType,
  LoginRequest as GrpcLoginRequest,
  RegisterRequest as GrpcRegisterRequest,
  InfoRequest,
  InfoResponse,
  LoginResponse,
  LoginType,
  LogoutRequest,
  LogoutResponse,
  PreloginRequest,
  PreloginResponse,
  RefreshRequest,
  RefreshResponse,
  RegisterResponse,
} from '../../protobuf/types/auth_service'
import process from 'node:process'
import { AuthService } from '../../protobuf/protoclasses'

// 单例 gRPC 客户端
const grpcAddress = process.env.GRPC_ADDRESS || 'localhost:50051'
const authClient = new AuthService({ serverAddress: grpcAddress })
// eslint-disable-next-line no-console
console.log('[auth-service] gRPC client connecting to:', grpcAddress)

// LoginType 映射
const loginTypeMap: Record<string, LoginType> = {
  'sse-wiki': 0, // STANDARD
  'github': 1, // GITHUB
  'sse-market': 2, // SSE_MARKET
}

// CodeType 映射
const codeTypeMap: Record<string, CodeType> = {
  registration: 0, // REGISTRATION
  password_reset: 1, // PASSWORD_RESET
}

/**
 * Auth Service - 封装 gRPC 调用
 */
export const authService = {
  /**
   * 预登录 - 生成 CSRF state
   */
  async prelogin(redirectUrl: string): Promise<PreloginResponse> {
    const req: PreloginRequest = { redirect_url: redirectUrl }
    return authClient.Prelogin(req)
  },

  /**
   * 登录
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const req: GrpcLoginRequest = {
      type: loginTypeMap[data.type] ?? 0,
      state: data.state,
      username: data.username || '',
      password: data.password || '',
      code: data.code || '',
    }
    return authClient.Login(req)
  },

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: string): Promise<InfoResponse> {
    const req: InfoRequest = { user_id: userId }
    return authClient.GetUserInfo(req)
  },

  /**
   * 发送验证码
   */
  async sendCode(data: SendCodeRequest): Promise<CodeResponse> {
    const req: CodeRequest = {
      email: data.email,
      type: codeTypeMap[data.type] ?? 0,
    }
    return authClient.SendCode(req)
  },

  /**
   * 注册
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const req: GrpcRegisterRequest = {
      username: data.username,
      password: data.password,
      email: data.email,
      code: data.code,
    }
    return authClient.Register(req)
  },

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    const req: RefreshRequest = { refresh_token: refreshToken }
    return authClient.RefreshToken(req)
  },

  /**
   * 登出
   */
  async logout(userId: string): Promise<LogoutResponse> {
    const req: LogoutRequest = { user_id: userId }
    return authClient.Logout(req)
  },
}

export default authService
