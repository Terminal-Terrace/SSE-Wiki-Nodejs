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
function functionTemplate(method: Method, serviceName: string) {
  const { name, req, resp } = method
  return `  async ${name}(req: ${serviceName}Types.${req}): Promise<${serviceName}Types.${resp}> {
    return this.rpcClient.call<${serviceName}Types.${req}, ${serviceName}Types.${resp}>('${name}', req)
  }`
}

/**
 * 生成单个服务类的定义（不含 import）
 */
function serviceClassTemplate(
  service: Service,
  protoServiceName: string,
): string {
  const { serviceName, methods } = service
  const packageName = protoServiceName.toLowerCase()
  const protoFileName = `${protoServiceName.toLowerCase()}.proto`

  return `/**
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
  constructor(config?: ServiceConfig) {
    const protoPath = path.join(import.meta.dirname, 'proto', '${protoServiceName.toLowerCase()}', '${protoFileName}')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: '${packageName}',
      serviceClassName: '${serviceName}',
      serverAddress: config?.serverAddress || 'localhost:50051',
      ...config?.rpcConfig,
    })
  }

${methods.map(method => functionTemplate(method, serviceName)).join('\n\n')}

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
}`
}

/**
 * 单个服务的信息（用于生成 protoclasses.ts）
 */
export interface ServiceInfo {
  /** proto 服务名（如 "authservice"，用于文件路径） */
  protoServiceName: string
  /** 服务定义（包含 serviceName 和方法列表） */
  service: Service
}

/**
 * 生成完整的 protoclasses.ts 文件
 * @param services 所有服务的信息
 * @returns 完整的 protoclasses.ts 文件内容
 */
export function protoClassesTemplate(services: ServiceInfo[]): string {
  // 1. 公共 import
  const commonImports = `import type { RpcClientConfig } from '@sse-wiki/rpc-client'
import path from 'node:path'
import { RpcClient } from '@sse-wiki/rpc-client'`

  // 2. 各个服务的类型 import
  const typeImports = services.map(({ service, protoServiceName }) =>
    `import type * as ${service.serviceName}Types from './types/${protoServiceName}'`,
  ).join('\n')

  // 3. 统一的 ServiceConfig 接口
  const serviceConfig = `/**
 * 服务客户端配置
 */
export interface ServiceConfig {
  serverAddress?: string
  /** 其他 RpcClient 配置 */
  rpcConfig?: Partial<Omit<RpcClientConfig, 'protoPath' | 'packageName' | 'serviceClassName' | 'serverAddress'>>
}`

  // 4. 各个服务的类定义
  const serviceClasses = services.map(({ service, protoServiceName }) =>
    serviceClassTemplate(service, protoServiceName),
  ).join('\n\n')

  // 5. 组合成完整文件
  return `${commonImports}
${typeImports}

${serviceConfig}

${serviceClasses}
`
}
