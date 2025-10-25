import process from 'node:process'
import Koa from 'koa'

const app = new Koa()
const PORT = process.env.PORT || 3000

app.use(async (ctx) => {
  ctx.body = 'Hello SSE Wiki!'
})

app.listen(PORT, () => {
})
