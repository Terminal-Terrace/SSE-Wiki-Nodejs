import type { Context } from 'koa'
import { Metadata } from '@sse-wiki/rpc-client'

/**
 * 从 Koa Context 获取 JWT token
 * 优先从 Cookie 获取，其次从 Authorization header 获取
 */
export function getTokenFromContext(ctx: Context): string | undefined {
  // 1. 尝试从 Cookie 获取
  const cookieToken = ctx.cookies.get('access_token')
  if (cookieToken) {
    return cookieToken
  }

  // 2. 尝试从 Authorization header 获取
  const authHeader = ctx.headers.authorization
  if (authHeader) {
    // 移除 "Bearer " 前缀
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7)
    }
    return authHeader
  }

  return undefined
}

/**
 * 创建带有 JWT token 的 gRPC Metadata
 * 用于透传用户身份到 Go 后端
 */
export function createAuthMetadata(token?: string): Metadata {
  const metadata = new Metadata()
  if (token) {
    metadata.set('authorization', `Bearer ${token}`)
  }
  return metadata
}

/**
 * 从 Koa Context 创建 gRPC Metadata
 * 便捷方法，组合 getTokenFromContext 和 createAuthMetadata
 */
export function createMetadataFromContext(ctx: Context): Metadata {
  const token = getTokenFromContext(ctx)
  return createAuthMetadata(token)
}
