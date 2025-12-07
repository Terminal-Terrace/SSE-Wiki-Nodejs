import type { Context } from 'koa'
import Router from '@koa/router'
import { fileController } from '../controller/file'

const router = new Router()

// 文件上传相关路由
const fileRouter = new Router({ prefix: '/api/v1/files' })

fileRouter.post('/upload/init', ctx => fileController.initUpload(ctx))
fileRouter.post('/upload/sign', ctx => fileController.signUpload(ctx))
fileRouter.post('/upload/complete', ctx => fileController.completeUpload(ctx))
fileRouter.post('/batch-info', ctx => fileController.batchInfo(ctx))

router.use(fileRouter.routes())
router.use(fileRouter.allowedMethods())

// 健康检查
router.get('/health', (ctx: Context) => {
  ctx.body = { status: 'ok', service: 'file-service' }
})

export default router
