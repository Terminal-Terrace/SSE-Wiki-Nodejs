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
  /** 默认使用errorMessage中的错误信息 */
  message?: string
  /** 这次错误需要记录的普通日志 */
  info?: string
  /** 用于记录的错误信息 */
  error?: Error
  constructor(code: number, options?: { message: string, info: string, error: Error }) {
    this.code = code
    const { message, info, error } = options || {}
    this.message = message
    this.info = info
    this.error = error
  }
}
