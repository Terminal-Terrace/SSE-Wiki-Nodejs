import type { Context, Next } from 'koa'
import type { AuthUser } from '../protobuf/types/authservice'
import jwt from 'jsonwebtoken'

export interface AuthMiddlewareOptions {
  /** JWT密钥 */
  secret: string
  /** 可选：token前缀，默认为 'Bearer' */
  tokenPrefix?: string
}

/**
 * 解析 Authorization Header 的 JWT，填充 ctx.state.user
 * 若无 token 或解析失败，不会抛错，仅跳过
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions) {
  const { secret, tokenPrefix = 'Bearer' } = options

  return async (ctx: Context, next: Next) => {
    const cookieToken = ctx.cookies.get('access_token')
    const authHeader = ctx.headers.authorization

    if (!cookieToken && !authHeader) {
      await next()
      return
    }

    try {
      const token = cookieToken || (authHeader && authHeader.startsWith(`${tokenPrefix} `)
        ? authHeader.slice(tokenPrefix.length + 1)
        : authHeader)

      if (!token) {
        await next()
        return
      }

      const decoded = jwt.verify(token, secret) as AuthUser
      ctx.state.user = decoded
    }
    catch {
      // Token verification failed, continue without user
    }

    await next()
  }
}
