import type { Context, Next } from 'koa'
import { LogicError } from './types'

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next()
  }
  catch (err: unknown) {
    if (err instanceof LogicError) {
      ctx.status = 200
      const { code, message, error } = err
      ctx.body = {
        code,
        message,
      }

      if (error) {
        console.error('LogicError:', error)
      }
    }

    ctx.status = 500
    ctx.body = {
      code: -1,
      message: 'Internal Server Error',
    }
  }
}

export type * from './types'
