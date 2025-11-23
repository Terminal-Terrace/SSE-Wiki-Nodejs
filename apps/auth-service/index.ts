import process from 'node:process'
import { bodyParser } from '@koa/bodyparser'
import { ContextMiddleware } from '@sse-wiki/context'
import { errorHandler } from '@sse-wiki/error'
import { loggerMiddleware } from '@sse-wiki/logger'
import { responseMiddleware } from '@sse-wiki/response'
import Koa from 'koa'
import { createAuthMiddleware } from './middleware/auth'
import router from './router'

const app = new Koa()
const PORT = process.env.PORT || 3000

// 日志中间件
app.use(loggerMiddleware)

// 全局错误处理
app.use(errorHandler)

app.use(responseMiddleware)

app.use(ContextMiddleware)

// JWT认证中间件
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
  console.log(`Server is running on http://localhost:${PORT}`)
})
