import Router from '@koa/router'
import TemplateController from '../controller/template'

const router = new Router()

// 示例路由
router.get('/api/example', TemplateController.success)

// 带参数校验的示例路由
router.post('/api/users', TemplateController.createUser) // 校验 body
router.get('/api/users', TemplateController.listUsers) // 校验 query
router.get('/api/users/:id', TemplateController.getUserById) // 校验 params

export default router
