export interface Logger {
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
}

export interface LoggerContext {
  /**
   * 用来代替 console.log 的类型定义
   * 自动添加时间戳、请求方法和请求 URL
   */
  logger: Logger
}
