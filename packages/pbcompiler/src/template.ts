/** 提供模板字符串 */

// Service 相关类型
export interface Method {
  name: string
  req: string
  resp: string
}

export interface Service {
  serviceName: string
  methods: Method[]
}

export type RpcMethod<Req, Res> = (req: Req) => Promise<Res>

export interface RpcService {
  [key: string]: RpcMethod<any, any>
}

// 类型定义相关
export interface MessageField {
  name: string
  type: string
  fieldNumber: number
  isRepeated?: boolean
  isOptional?: boolean
}

export interface MessageType {
  name: string
  fields: MessageField[]
}

export interface EnumValue {
  name: string
  value: number
}

export interface EnumType {
  name: string
  values: EnumValue[]
}

// 类型模板函数
function messageTemplate(message: MessageType): string {
  const { name, fields } = message
  const fieldLines = fields.map((field) => {
    let type = field.type

    // 处理 repeated（数组）
    if (field.isRepeated) {
      type = `${type}[]`
    }

    // 处理 optional（可选）
    const optionalMarker = field.isOptional ? '?' : ''

    return `  ${field.name}${optionalMarker}: ${type}`
  }).join('\n')

  return `export interface ${name} {
${fieldLines}
}`
}

function enumTemplate(enumType: EnumType): string {
  const { name, values } = enumType
  const valueLines = values.map(v => `  ${v.name} = ${v.value},`).join('\n')
  return `export enum ${name} {
${valueLines}
}`
}

export function typesTemplate(messages: MessageType[], enums: EnumType[]): string {
  const enumsCode = enums.map(e => enumTemplate(e)).join('\n\n')
  const messagesCode = messages.map(m => messageTemplate(m)).join('\n\n')

  // 先生成 enum，再生成 message（因为 message 可能引用 enum）
  const parts = []
  if (enumsCode)
    parts.push(enumsCode)
  if (messagesCode)
    parts.push(messagesCode)

  return parts.join('\n\n')
}

// Service 模板函数
function functionTemplate(method: Method) {
  const { name, req, resp } = method
  return `  async ${name}(req: Types.${req}): Promise<Types.${resp}> {
    return this.rpcClient.call<Types.${req}, Types.${resp}>('${name}', req)
  }`
}

export function serviceTemplate(
  service: Service,
  typesFileName: string,
  protoServiceName: string,
  serverAddress: string,
): string {
  const { serviceName, methods } = service
  const packageName = protoServiceName.toLowerCase()
  const protoFileName = `${protoServiceName.toLowerCase()}.proto`

  return `import path from 'path'
import { RpcClient, type RpcClientConfig } from '@sse-wiki/rpc-client'
import type * as Types from './${typesFileName}'

/**
 * ${serviceName} 客户端配置
 */
export interface ${serviceName}Config {
  /** gRPC 服务器地址，默认为 '${serverAddress}' */
  serverAddress?: string
  /** 其他 RpcClient 配置 */
  rpcConfig?: Partial<Omit<RpcClientConfig, 'protoPath' | 'packageName' | 'serviceClassName' | 'serverAddress'>>
}

/**
 * ${serviceName} 客户端
 *
 * 使用示例：
 * \`\`\`typescript
 * const client = new ${serviceName}()
 * const response = await client.GetUser({ id: 123 })
 * \`\`\`
 */
export class ${serviceName} {
  private rpcClient: RpcClient

  /**
   * 创建 ${serviceName} 客户端
   * @param config 可选配置
   */
  constructor(config?: ${serviceName}Config) {
    const protoPath = path.join(__dirname, '${protoServiceName.toLowerCase()}', '${protoFileName}')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: '${packageName}',
      serviceClassName: '${serviceName}',
      serverAddress: config?.serverAddress || '${serverAddress}',
      ...config?.rpcConfig,
    })
  }

${methods.map(method => functionTemplate(method)).join('\n\n')}

  /**
   * 关闭 gRPC 连接
   */
  close(): void {
    this.rpcClient.close()
  }

  /**
   * 等待连接就绪
   * @param deadline 超时时间（毫秒）
   */
  async waitForReady(deadline?: number): Promise<void> {
    return this.rpcClient.waitForReady(deadline)
  }
}
`
}
