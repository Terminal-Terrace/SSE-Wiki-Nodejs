export interface LoggerContext {
/**
 * 用来代替 console.log 的类型定义
 * 自动添加时间戳、请求方法和请求 URL
 */
  log: (...args: any[]) => void
}

export class LogicError {
  /** 返回给前端的错误码 */
  code: number
  /** 返回给前端的信息 */
  message: string
  /** 用于记录的错误信息 */
  error?: Error
  constructor(code: number, message: string, options?: { error: Error }) {
    this.code = code
    this.message = message
    if (options?.error) {
      this.error = options.error
    }
  }
}
