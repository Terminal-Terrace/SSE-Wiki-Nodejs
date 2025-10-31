import type { Context, Next } from 'koa'
import { createLogger } from './logger'

export async function loggerMiddleware(ctx: Context, next: Next) {
  ctx.logger = createLogger(ctx)
  await next()
}
