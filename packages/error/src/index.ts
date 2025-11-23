import type { Context, Next } from 'koa'

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next()
  }
  catch (err: unknown) {
    ctx.status = 500
    ctx.body = {
      code: -1,
      message: 'Internal Server Error',
    }

    console.error('Unhandled error:', err)
  }
}

export type * from './types'
