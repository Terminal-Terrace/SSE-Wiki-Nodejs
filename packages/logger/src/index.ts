import type { Context, Next } from 'koa'

export async function logger(ctx: Context, next: Next) {
  ctx.log = (...args: any[]) => {
    // eslint-disable-next-line no-console
    console.log(`[${new Date().toISOString()}]`, ctx.method, ctx.url, ...args)
  }
  await next()
}

export type * from './types'
