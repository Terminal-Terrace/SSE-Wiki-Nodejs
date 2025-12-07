export const ErrorCode = {
  /** 如果看到这个，说明代码有未捕获的错误 */
  UNKNOWN: -1,
  /** 参数错误 */
  INVALID_PARAMS: 1,
  // TODO: 服务按需拓展
} as const

export const ErrorMessage = {
  [ErrorCode.UNKNOWN]: '未知错误',
  [ErrorCode.INVALID_PARAMS]: '参数错误',
} as const
