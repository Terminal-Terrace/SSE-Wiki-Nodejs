import type { Context } from 'koa'
import type { z } from 'zod'
import { LogicError } from '@sse-wiki/error'
import { ErrorCode } from '../error'

/**
 * 校验请求数据
 * @param ctx Koa Context
 * @param schema Zod schema
 * @param source 数据来源：'body' | 'query' | 'params'
 * @returns 校验后的数据
 * @throws 校验失败时会自动设置响应，并抛出错误中断后续执行
 */
export function validate<T>(
  ctx: Context,
  schema: z.ZodType<T>,
  source: 'body' | 'query' | 'params' = 'body',
): T {
  try {
    // 根据来源获取数据
    let data
    switch (source) {
      case 'body':
        data = ctx.request.body
        break
      case 'query':
        data = ctx.query
        break
      case 'params':
        data = ctx.params
        break
    }

    // 使用 zod 校验数据并返回
    return schema.parse(data)
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (_err) {
    const code = ErrorCode.INVALID_PARAMS
    throw new LogicError(code)
  }
}
