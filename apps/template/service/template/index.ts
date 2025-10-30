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
    throw new LogicError(ErrorCode.UNKNOWN, 'This is a template service error')
  }
}

export default new TemplateService()
