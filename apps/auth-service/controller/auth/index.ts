import type { Context } from 'koa'
import { authService } from '../../service/auth'
import {
  loginSchema,
  preloginSchema,
  registerSchema,
  sendCodeSchema,
} from './schema'

// Cookie 配置常量
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000 // 15 分钟
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 天

const COOKIE_OPTIONS = {
  httpOnly: true,
  path: '/',
  secure: false, // 开发环境设为 false
  sameSite: 'lax' as const,
}

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
 * Auth Controller
 */
export const authController = {
  /**
   * 预登录 - 生成 CSRF state
   * POST /api/v1/auth/prelogin
   */
  async prelogin(ctx: Context) {
    const result = preloginSchema.safeParse(ctx.request.body)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }

    try {
      const response = await authService.prelogin(result.data.redirect_url)
      success(ctx, { state: response.state })
    }
    catch (err: any) {
      console.error('[prelogin] gRPC error:', err)
      error(ctx, 0, err.details || err.message || '服务暂时不可用')
    }
  },

  /**
   * 登录
   * POST /api/v1/auth/login
   */
  async login(ctx: Context) {
    const result = loginSchema.safeParse(ctx.request.body)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }

    try {
      const response = await authService.login(result.data)

      // 设置 Cookie
      ctx.cookies.set('access_token', response.access_token, {
        ...COOKIE_OPTIONS,
        maxAge: ACCESS_TOKEN_MAX_AGE,
      })
      ctx.cookies.set('refresh_token', response.refresh_token, {
        ...COOKIE_OPTIONS,
        maxAge: REFRESH_TOKEN_MAX_AGE,
      })

      success(ctx, { redirect_url: response.redirect_url })
    }
    catch (err: any) {
      error(ctx, 401, err.details || err.message || '登录失败')
    }
  },

  /**
   * 获取当前用户信息
   * GET /api/v1/auth/me
   */
  async me(ctx: Context) {
    // 从 JWT 中间件获取用户信息
    const userId = ctx.state.user?.user_id
    if (!userId) {
      return error(ctx, 401, '未登录')
    }

    try {
      const response = await authService.getUserInfo(userId)
      success(ctx, response.user)
    }
    catch (err: any) {
      error(ctx, 0, err.details || err.message || '获取用户信息失败')
    }
  },

  /**
   * 发送验证码
   * POST /api/v1/auth/code
   */
  async sendCode(ctx: Context) {
    const result = sendCodeSchema.safeParse(ctx.request.body)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }

    try {
      await authService.sendCode(result.data)
      success(ctx)
    }
    catch (err: any) {
      error(ctx, 0, err.details || err.message || '发送验证码失败')
    }
  },

  /**
   * 注册
   * POST /api/v1/auth/register
   */
  async register(ctx: Context) {
    const result = registerSchema.safeParse(ctx.request.body)
    if (!result.success) {
      return error(ctx, 1, result.error.issues[0]?.message || '参数错误')
    }

    try {
      const response = await authService.register(result.data)

      // 设置 Cookie
      ctx.cookies.set('refresh_token', response.refresh_token, {
        ...COOKIE_OPTIONS,
        maxAge: REFRESH_TOKEN_MAX_AGE,
      })

      success(ctx, { redirect_url: response.redirect_url })
    }
    catch (err: any) {
      error(ctx, 0, err.details || err.message || '注册失败')
    }
  },

  /**
   * 刷新 Token
   * POST /api/v1/auth/refresh
   */
  async refresh(ctx: Context) {
    const refreshToken = ctx.cookies.get('refresh_token')
    if (!refreshToken) {
      return error(ctx, 401, '未找到刷新令牌')
    }

    try {
      const response = await authService.refreshToken(refreshToken)

      // 更新 Cookie
      ctx.cookies.set('access_token', response.access_token, {
        ...COOKIE_OPTIONS,
        maxAge: ACCESS_TOKEN_MAX_AGE,
      })
      ctx.cookies.set('refresh_token', response.refresh_token, {
        ...COOKIE_OPTIONS,
        maxAge: REFRESH_TOKEN_MAX_AGE,
      })

      success(ctx, { access_token: response.access_token })
    }
    catch (err: any) {
      error(ctx, 401, err.details || err.message || '刷新令牌失败')
    }
  },

  /**
   * 登出
   * POST /api/v1/auth/logout
   */
  async logout(ctx: Context) {
    // 清除 Cookie
    ctx.cookies.set('access_token', '', { ...COOKIE_OPTIONS, maxAge: 0 })
    ctx.cookies.set('refresh_token', '', { ...COOKIE_OPTIONS, maxAge: 0 })

    // 可选：调用 gRPC 通知后端
    const userId = ctx.state.user?.user_id
    if (userId) {
      try {
        await authService.logout(userId)
      }
      catch {
        // 忽略错误，Cookie 已清除
      }
    }

    success(ctx)
  },
}

export default authController
