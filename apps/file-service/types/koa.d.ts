import type { LoggerContext } from '@sse-wiki/logger'
import type { ResponseContext } from '@sse-wiki/response'
import type { Values } from '.'
import type { ErrorCode } from '../error'
import type { AuthUser } from '../middleware/auth'
import 'koa'

declare module 'koa' {
  interface BaseContext extends LoggerContext, ResponseContext<Values<typeof ErrorCode>> {
    /** 当前登录用户信息，由auth中间件解析JWT后填充 */
    user?: AuthUser
  }
}

export {}
