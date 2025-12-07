import { LogicError } from '@sse-wiki/error'
import { ErrorCode } from '../../error'

class TemplateService {
  async success() {
    // 这里可以调用其他微服务或处理业务逻辑
    return {
      message: 'Hello from service layer',
      timestamp: new Date().toISOString(),
    }
  }

  async fail() {
    /**
     * 如果service层需要返回错误，抛出LogicError即可
     */
    throw new LogicError(ErrorCode.UNKNOWN)
  }
}

export default new TemplateService()
