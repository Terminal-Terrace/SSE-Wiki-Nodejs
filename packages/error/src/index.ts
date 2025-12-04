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

export class LogicError {
  /** 返回给前端的错误码 */
  code: number
  /** 默认使用errorMessage中的错误信息 */
  message?: string
  /** 这次错误需要记录的普通日志 */
  info?: string
  /** 用于记录的错误信息 */
  error?: Error
  constructor(
    code: number,
    options?: { message: string, info: string, error: Error },
  ) {
    this.code = code
    const { message, info, error } = options || {}
    this.message = message
    this.info = info
    this.error = error
  }
}
