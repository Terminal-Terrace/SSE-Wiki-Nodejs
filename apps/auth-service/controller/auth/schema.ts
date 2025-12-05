import { z } from 'zod'

// Prelogin 请求
export const preloginSchema = z.object({
  redirect_url: z.string().url('redirect_url 必须是有效的 URL'),
})

// Login 请求
export const loginSchema = z.object({
  type: z.enum(['sse-wiki', 'github', 'sse-market']).default('sse-wiki'),
  state: z.string().min(1, 'state 不能为空'),
  username: z.string().optional(),
  password: z.string().optional(),
  code: z.string().optional(),
})

// Register 请求
export const registerSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符').max(50, '用户名最多50个字符'),
  password: z.string().min(6, '密码至少6个字符').max(100, '密码最多100个字符'),
  email: z.string().email('邮箱格式不正确'),
  code: z.string().length(6, '验证码必须是6位'),
})

// SendCode 请求
export const sendCodeSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  type: z.enum(['registration', 'password_reset']),
})

// 类型导出
export type PreloginRequest = z.infer<typeof preloginSchema>
export type LoginRequest = z.infer<typeof loginSchema>
export type RegisterRequest = z.infer<typeof registerSchema>
export type SendCodeRequest = z.infer<typeof sendCodeSchema>
