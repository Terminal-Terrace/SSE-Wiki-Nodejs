import Router from '@koa/router'
import { authController } from '../controller/auth'

const router = new Router()

// Auth 路由 - /api/v1/auth/*
const authRouter = new Router({ prefix: '/api/v1/auth' })

authRouter.post('/prelogin', authController.prelogin)
authRouter.post('/login', authController.login)
authRouter.get('/me', authController.me)
authRouter.post('/code', authController.sendCode)
authRouter.post('/register', authController.register)
authRouter.post('/refresh', authController.refresh)
authRouter.post('/logout', authController.logout)

// 注册 auth 路由
router.use(authRouter.routes())
router.use(authRouter.allowedMethods())

export default router
