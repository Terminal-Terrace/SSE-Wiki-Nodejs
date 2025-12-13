import process from 'node:process'
import { bodyParser } from '@koa/bodyparser'
import { ContextMiddleware } from '@sse-wiki/context'
import { errorHandler } from '@sse-wiki/error'
import { loggerMiddleware } from '@sse-wiki/logger'
import { responseMiddleware } from '@sse-wiki/response'
import Koa from 'koa'
import { createAuthMiddleware } from './middleware/auth'
import router from './router'
import 'dotenv/config'

const app = new Koa()
const PORT = process.env.PORT || 3002 // Node.js Gateway 端口

// CORS 配置 (与 Go 服务保持一致)
app.use(async (ctx, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
  ]
  const origin = ctx.get('Origin')
  if (allowedOrigins.includes(origin)) {
    ctx.set('Access-Control-Allow-Origin', origin)
  }
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  ctx.set('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization')
  ctx.set('Access-Control-Allow-Credentials', 'true')

  if (ctx.method === 'OPTIONS') {
    ctx.status = 204
    return
  }
  await next()
})

// 日志中间件
app.use(loggerMiddleware)

// 全局错误处理
app.use(errorHandler)

// 统一响应封装 + 上下文存储
app.use(responseMiddleware)
app.use(ContextMiddleware)

// JWT 解析中间件（用于识别登录状态）
app.use(createAuthMiddleware({
  secret: process.env.JWT_SECRET || 'your-secret-key',
}))

// 请求体解析
app.use(bodyParser())

// 注册路由
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[auth-service] Node.js Gateway running on http://localhost:${PORT}`)
})
