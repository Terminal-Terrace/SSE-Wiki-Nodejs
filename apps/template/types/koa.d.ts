import type { LoggerContext } from '@sse-wiki/logger'
import type { ResponseContext } from '@sse-wiki/response'
import 'koa'

declare module 'koa' {
  interface BaseContext extends LoggerContext, ResponseContext {}
}

export {}
