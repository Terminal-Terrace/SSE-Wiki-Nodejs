import { z } from 'zod'

// 示例：创建用户的请求体校验
export const createUserSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符').max(20, '用户名最多20个字符'),
  email: z.string().email('邮箱格式不正确'),
  age: z.number().int('年龄必须是整数').min(1, '年龄必须大于0').optional(),
})

// 示例：查询参数校验
export const queryUserSchema = z.object({
  page: z.string().transform(val => Number.parseInt(val, 10)).pipe(z.number().int().min(1)).optional(),
  pageSize: z.string().transform(val => Number.parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).optional(),
  keyword: z.string().optional(),
})

// 示例：路由参数校验
export const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID必须是数字'),
})

// 导出类型
export type CreateUserInput = z.infer<typeof createUserSchema>
export type QueryUserInput = z.infer<typeof queryUserSchema>
export type UserIdInput = z.infer<typeof userIdSchema>
