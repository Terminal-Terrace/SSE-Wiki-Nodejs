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
 * 从Authorization header中解析JWT token并将用户信息存入ctx.user
 * 如果没有token或token无效，不会抛错，只是不设置ctx.user
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions) {
  const { secret, tokenPrefix = 'Bearer' } = options

  return async (ctx: Context, next: Next) => {
    const authHeader = ctx.headers.authorization

    if (!authHeader) {
      return
    }
    try {
      // 提取token
      const token = authHeader.startsWith(`${tokenPrefix} `)
        ? authHeader.slice(tokenPrefix.length + 1)
        : authHeader

      const decoded = jwt.verify(token, secret) as AuthUser

      ctx.user = decoded
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (_) {

    }

    await next()
  }
}
