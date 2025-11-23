import type { Context } from 'koa'
import TemplateService from '../../service/template'
import { validate } from '../../utils/validate'
import { createUserSchema, queryUserSchema, userIdSchema } from './schema'

class TemplateController {
  success(ctx: Context) {
    ctx.log('123')
    ctx.success('ok')
  }

  error() {
    TemplateService.fail()
  }

  // 示例：创建用户 - 校验 body
  createUser(ctx: Context) {
    // 校验请求体，校验失败会自动返回错误
    const data = validate(ctx, createUserSchema, 'body')

    // data 已经有完整的类型提示
    ctx.log(`Creating user: ${data.username}, ${data.email}`)

    // 处理业务逻辑...
    ctx.success({ id: 1, ...data })
  }

  // 示例：查询用户列表 - 校验 query
  listUsers(ctx: Context) {
    // 校验查询参数
    const query = validate(ctx, queryUserSchema, 'query')

    ctx.log(`Querying users: page=${query.page}, pageSize=${query.pageSize}`)

    // 处理业务逻辑...
    ctx.success({
      list: [],
      total: 0,
      page: query.page || 1,
      pageSize: query.pageSize || 10,
    })
  }

  // 示例：获取用户详情 - 校验 params
  getUserById(ctx: Context) {
    // 校验路由参数
    const params = validate(ctx, userIdSchema, 'params')

    ctx.log(`Getting user by id: ${params.id}`)

    // 处理业务逻辑...
    ctx.success({ id: params.id, username: 'test' })
  }
}

export default new TemplateController()
