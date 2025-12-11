import Router from '@koa/router'
import { articleController } from '../controller/article'
import { authController } from '../controller/auth'
import { discussionController } from '../controller/discussion'
import { moduleController } from '../controller/module'
import { reviewController } from '../controller/review'
import { userController } from '../controller/user'

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
authRouter.patch('/profile', authController.updateProfile)

// Module 路由 - /api/v1/modules/*
const moduleRouter = new Router({ prefix: '/api/v1/modules' })

// 浏览功能（可选认证）
moduleRouter.get('/', moduleController.getModuleTree)
moduleRouter.get('/:id', moduleController.getModule)
moduleRouter.get('/:id/breadcrumbs', moduleController.getBreadcrumbs)
moduleRouter.get('/:id/articles', articleController.getArticlesByModule)

// 管理功能（需要认证）
moduleRouter.post('/', moduleController.createModule)
moduleRouter.put('/:id', moduleController.updateModule)
moduleRouter.delete('/:id', moduleController.deleteModule)

// 协作者管理（需要认证）
moduleRouter.get('/:id/moderators', moduleController.getModerators)
moduleRouter.post('/:id/moderators', moduleController.addModerator)
moduleRouter.delete('/:id/moderators/:userId', moduleController.removeModerator)

// 编辑锁（需要认证）
moduleRouter.post('/lock', moduleController.handleLock)

// 注册 auth 路由
router.use(authRouter.routes())
router.use(authRouter.allowedMethods())

// 注册 module 路由
router.use(moduleRouter.routes())
router.use(moduleRouter.allowedMethods())

// Article 路由 - /api/v1/articles/*
const articleRouter = new Router({ prefix: '/api/v1/articles' })

// 编辑功能（需要认证）- 静态路由放前面
articleRouter.post('/', articleController.createArticle)
articleRouter.post('/update-user-favour', articleController.updateUserFavouriteArticles)

// 浏览功能（可选认证）- 带子路径的动态路由放在纯动态路由前面
articleRouter.get('/:id/user-favour', articleController.getUserFavourArticle)
articleRouter.get('/:id/versions', articleController.getVersions)
articleRouter.get('/:id/discussions', discussionController.getArticleComments)
articleRouter.post('/:id/discussions', discussionController.createComment)

// 协作者管理（需要认证）
articleRouter.get('/:id/collaborators', articleController.getCollaborators)
articleRouter.post('/:id/collaborators', articleController.addCollaborator)
articleRouter.delete('/:id/collaborators/:userId', articleController.removeCollaborator)

// 纯动态路由放最后
articleRouter.get('/:id', articleController.getArticle)
articleRouter.post('/:id/submissions', articleController.createSubmission)
articleRouter.patch('/:id/basic-info', articleController.updateBasicInfo)

// Version 路由 - /api/v1/versions/*
const versionRouter = new Router({ prefix: '/api/v1/versions' })
versionRouter.get('/:id', articleController.getVersion)
versionRouter.get('/:id/diff', articleController.getVersionDiff)

// 注册 article 路由
router.use(articleRouter.routes())
router.use(articleRouter.allowedMethods())

// 注册 version 路由
router.use(versionRouter.routes())
router.use(versionRouter.allowedMethods())

// Review 路由 - /api/v1/reviews/*
const reviewRouter = new Router({ prefix: '/api/v1/reviews' })

reviewRouter.get('/', reviewController.getReviews)
reviewRouter.get('/:id', reviewController.getReviewDetail)
reviewRouter.post('/:id/action', reviewController.reviewAction)

// 注册 review 路由
router.use(reviewRouter.routes())
router.use(reviewRouter.allowedMethods())

// Discussion 路由 - /api/v1/discussions/*
const discussionRouter = new Router({ prefix: '/api/v1/discussions' })

discussionRouter.post('/:id/replies', discussionController.replyComment)
discussionRouter.put('/:id', discussionController.updateComment)
discussionRouter.delete('/:id', discussionController.deleteComment)

// 注册 discussion 路由
router.use(discussionRouter.routes())
router.use(discussionRouter.allowedMethods())

// User 路由 - /api/v1/users/*
const userRouter = new Router({ prefix: '/api/v1/users' })

// 用户搜索（需要认证）
userRouter.get('/search', userController.searchUsers)

// 获取用户公开信息（可选认证）
userRouter.get('/:id', userController.getUserById)

// 注册 user 路由
router.use(userRouter.routes())
router.use(userRouter.allowedMethods())

export default router
