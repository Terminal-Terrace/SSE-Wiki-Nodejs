import type { Context, Next } from 'koa'
import { AsyncLocalStorage } from 'node:async_hooks'

const asyncLocalStorage = new AsyncLocalStorage<Context>()

export function ContextMiddleware(ctx: Context, next: Next) {
  return asyncLocalStorage.run(ctx, () => next())
}

export function getCtx(): Context {
  const store = asyncLocalStorage.getStore()
  if (!store) {
    throw new Error('No context available')
  }
  return store
}
