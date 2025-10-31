import process from 'node:process'
import { bodyParser } from '@koa/bodyparser'
import { ContextMiddleware } from '@sse-wiki/context'
import { errorHandler } from '@sse-wiki/error'
import { loggerMiddleware } from '@sse-wiki/logger'
import { responseMiddleware } from '@sse-wiki/response'
import Koa from 'koa'
import router from './router'

const app = new Koa()
const PORT = process.env.PORT || 3000

// 全局错误处理
app.use(errorHandler)

// 日志中间件
app.use(loggerMiddleware)
app.use(responseMiddleware)

app.use(ContextMiddleware)

// 请求体解析
app.use(bodyParser())

// 注册路由
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`)
})
