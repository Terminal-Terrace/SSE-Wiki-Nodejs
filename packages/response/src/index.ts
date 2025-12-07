import type { Context, Next } from 'koa'

export async function responseMiddleware(ctx: Context, next: Next) {
  ctx.success = <T>(data: T) => {
    ctx.status = 200
    ctx.body = {
      data,
      code: 100,
      message: '',
    }
  }
  await next()
}

export type * from './types'
