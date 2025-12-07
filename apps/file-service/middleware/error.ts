import type { Context, Next } from 'koa'
import { LogicError } from '@sse-wiki/error'
import { ZodError } from 'zod'
import { ErrorCode, ErrorMessage } from '../error'

export async function LogicErrorMiddleware(ctx: Context, next: Next) {
  try {
    await next()
  }
  catch (err) {
    if (err instanceof ZodError) {
      ctx.status = 200
      const message = err.issues?.[0]?.message || ErrorMessage[ErrorCode.INVALID_PARAMS]
      ctx.body = {
        code: ErrorCode.INVALID_PARAMS,
        message,
      }
    }
    else if (err instanceof LogicError) {
      const { code, message, info, error } = err
      ctx.status = 200
      ctx.body = {
        code,
        message: message || ErrorMessage[code as keyof typeof ErrorMessage],
      }

      const { logger } = ctx
      info && logger.info(info)
      error && logger.error(error)
    }
    else {
      throw err
    }
  }
}
