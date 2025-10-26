import type { EnumType, MessageField, MessageType, Method } from './template'
// 读取pb文件并使用template生成对应的ts文件
import { serviceTemplate, typesTemplate } from './template'

/**
 * Proto 类型到 TypeScript 类型的映射
 */
function mapProtoTypeToTs(protoType: string): string {
  const typeMap: Record<string, string> = {
    // 32位整数 - 安全使用 number
    int32: 'number',
    uint32: 'number',
    sint32: 'number',
    fixed32: 'number',
    sfixed32: 'number',

    // 64位整数 - 超出 Number.MAX_SAFE_INTEGER，使用 string
    // 注意: protobuf.js 等库通常序列化为 string 来避免精度丢失
    int64: 'string',
    uint64: 'string',
    sint64: 'string',
    fixed64: 'string',
    sfixed64: 'string',

    // 浮点数
    float: 'number',
    double: 'number',

    // 其他基本类型
    bool: 'boolean',
    string: 'string',
    bytes: 'Uint8Array',
  }

  return typeMap[protoType] || protoType // 自定义类型保持原样
}

/**
 * 提取所有 enum 定义
 */
function extractEnums(proto: string): EnumType[] {
  const enumRegex = /enum\s+(\w+)\s*\{([^}]*)\}/g
  const enums: EnumType[] = []

  let enumMatch = enumRegex.exec(proto)
  while (enumMatch !== null) {
    const name = enumMatch[1]
    const body = enumMatch[2]

    // 提取枚举值
    const valueRegex = /(\w+)\s*=\s*(\d+)/g
    const values: { name: string, value: number }[] = []

    let valueMatch = valueRegex.exec(body)
    while (valueMatch !== null) {
      values.push({
        name: valueMatch[1],
        value: Number.parseInt(valueMatch[2]),
      })
      valueMatch = valueRegex.exec(body)
    }

    enums.push({ name, values })
    enumMatch = enumRegex.exec(proto)
  }

  return enums
}

/**
 * 提取所有 message 定义
 */
function extractMessages(proto: string): MessageType[] {
  const messageRegex = /message\s+(\w+)\s*\{([^}]*)\}/g
  const messages: MessageType[] = []

  let messageMatch = messageRegex.exec(proto)
  while (messageMatch !== null) {
    const name = messageMatch[1]
    const body = messageMatch[2]

    // 提取字段：[optional|repeated] 类型 名称 = 编号;
    const fieldRegex = /(optional|repeated)?\s*(\w+)\s+(\w+)\s*=\s*(\d+)/g
    const fields: MessageField[] = []

    let fieldMatch = fieldRegex.exec(body)
    while (fieldMatch !== null) {
      const modifier = fieldMatch[1] // optional | repeated | undefined
      const protoType = fieldMatch[2]
      const fieldName = fieldMatch[3]
      const fieldNumber = Number.parseInt(fieldMatch[4])

      fields.push({
        name: fieldName,
        type: mapProtoTypeToTs(protoType),
        fieldNumber,
        isRepeated: modifier === 'repeated',
        isOptional: modifier === 'optional',
      })
      fieldMatch = fieldRegex.exec(body)
    }

    messages.push({ name, fields })
    messageMatch = messageRegex.exec(proto)
  }

  return messages
}

export interface GeneratedCode {
  types: string
  service: string
}

/**
 * 将 proto 文件内容转换为 TypeScript 客户端代码
 * @param proto - proto 文件内容字符串
 * @param protoServiceName - proto 服务名（如 "user"），用于 RpcClient 查找 proto 文件
 * @param typesFileName - 类型文件名（不含扩展名），默认为 'types'
 * @param serverAddress - 默认的 gRPC 服务器地址
 * @returns 生成的类型文件和服务文件代码
 */
export function protoToTs(
  proto: string,
  protoServiceName: string,
  typesFileName = 'types',
  serverAddress = 'localhost:50051',
): GeneratedCode {
  // 1. 提取 service 定义（约定：每个 proto 文件只有一个 service）
  const serviceRegex = /service\s+(\w+)\s*\{([^}]*)\}/
  const serviceMatch = serviceRegex.exec(proto)

  if (!serviceMatch) {
    throw new Error('No service definition found in proto file')
  }

  const serviceName = serviceMatch[1]
  const serviceBody = serviceMatch[2]

  // 2. 提取该 service 中的所有 rpc 方法
  const rpcRegex = /rpc\s+(\w+)\s*\(\s*(\w+)\s*\)\s*returns\s*\(\s*(\w+)\s*\)/g
  const methods: Method[] = []

  let rpcMatch = rpcRegex.exec(serviceBody)
  while (rpcMatch !== null) {
    methods.push({
      name: rpcMatch[1], // 方法名
      req: rpcMatch[2], // 请求类型
      resp: rpcMatch[3], // 响应类型
    })
    rpcMatch = rpcRegex.exec(serviceBody)
  }

  // 3. 提取类型定义
  const enums = extractEnums(proto)
  const messages = extractMessages(proto)

  // 4. 生成代码
  return {
    types: typesTemplate(messages, enums),
    service: serviceTemplate({ serviceName, methods }, typesFileName, protoServiceName, serverAddress),
  }
}
