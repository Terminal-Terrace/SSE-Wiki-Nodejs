export interface LoggerContext {
/**
 * 用来代替 console.log 的类型定义
 * 自动添加时间戳、请求方法和请求 URL
 */
  log: (...args: any[]) => void
}
