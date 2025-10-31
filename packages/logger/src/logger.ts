import type { Context } from 'koa'
import type { Logger } from './types'

export function createLogger(ctx: Context): Logger {
  return {
    info: (...args: any[]) => {
      // eslint-disable-next-line no-console
      console.log(`[INFO] [${new Date().toISOString()}]`, ctx.method, ctx.url, ...args)
    },
    warn: (...args: any[]) => {
      console.warn(`[WARN] [${new Date().toISOString()}]`, ctx.method, ctx.url, ...args)
    },
    error: (...args: any[]) => {
      console.error(`[ERROR] [${new Date().toISOString()}]`, ctx.method, ctx.url, ...args)
    },
  }
}
