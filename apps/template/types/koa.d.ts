import type { LoggerContext } from '@sse-wiki/logger'
import type { ResponseContext } from '@sse-wiki/response'
import type { Values } from '.'
import type { ErrorCode } from '../error'
import 'koa'

declare module 'koa' {
  interface BaseContext extends LoggerContext, ResponseContext<Values<typeof ErrorCode>> {}
}

export {}
