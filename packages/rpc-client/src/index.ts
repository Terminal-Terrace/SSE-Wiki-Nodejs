import type { ServiceClientConstructor } from '@grpc/grpc-js'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'

/**
 * RPC 客户端配置
 */
export interface RpcClientConfig {
  /** proto 文件路径 */
  protoPath: string
  /** proto package 名称 */
  packageName: string
  /** gRPC Service 类名 */
  serviceClassName: string
  /** gRPC 服务器地址 */
  serverAddress: string
  /** gRPC 凭证，默认使用 insecure */
  credentials?: grpc.ChannelCredentials
  /** proto-loader 选项 */
  loaderOptions?: protoLoader.Options
  /** gRPC 通道选项 */
  channelOptions?: grpc.ChannelOptions
}

/**
 * gRPC 客户端封装
 * 使用 @grpc/grpc-js 和 @grpc/proto-loader 动态加载 proto 文件
 */
export class RpcClient {
  private client: any
  private serviceName: string

  constructor(config: RpcClientConfig) {
    const { protoPath, packageName, serviceClassName, serverAddress } = config

    this.serviceName = serviceClassName

    // 默认的 proto-loader 选项
    const loaderOptions: protoLoader.Options = {
      keepCase: true, // 保持字段名大小写
      longs: String, // int64 转为 string
      enums: String, // enum 转为 string
      defaults: true, // 设置默认值
      oneofs: true, // 支持 oneof
      ...config.loaderOptions,
    }

    // 加载 proto 文件
    const packageDefinition = protoLoader.loadSync(protoPath, loaderOptions)
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any

    // 获取服务构造函数
    const packageObj = packageName.split('.').reduce((obj, key) => obj[key], protoDescriptor)
    const ServiceConstructor = packageObj[serviceClassName] as ServiceClientConstructor

    if (!ServiceConstructor) {
      throw new Error(
        `Service "${serviceClassName}" not found in package "${packageName}". `
        + `Available services: ${Object.keys(packageObj).join(', ')}\n`
        + `Proto file: ${protoPath}`,
      )
    }

    // 创建客户端实例
    const credentials = config.credentials || grpc.credentials.createInsecure()
    this.client = new ServiceConstructor(serverAddress, credentials, config.channelOptions)
  }

  /**
   * 调用 gRPC 方法
   * @param methodName 方法名
   * @param request 请求参数
   * @returns Promise 响应
   */
  async call<Req, Res>(methodName: string, request: Req): Promise<Res> {
    return new Promise((resolve, reject) => {
      if (typeof this.client[methodName] !== 'function') {
        const proto = Object.getPrototypeOf(this.client)
        const availableMethods = Object.keys(proto).filter(k => k !== 'constructor').join(', ')
        reject(
          new Error(
            `Method "${methodName}" not found in service "${this.serviceName}". `
            + `Available methods: ${availableMethods}`,
          ),
        )
        return
      }

      this.client[methodName](request, (error: grpc.ServiceError | null, response: Res) => {
        if (error) {
          reject(error)
        }
        else {
          resolve(response)
        }
      })
    })
  }

  /**
   * 关闭客户端连接
   */
  close(): void {
    this.client.close()
  }

  /**
   * 等待客户端连接就绪
   * @param deadline 截止时间（毫秒）
   */
  async waitForReady(deadline?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const deadlineTime = deadline ? Date.now() + deadline : Infinity
      this.client.waitForReady(deadlineTime, (error: Error | null) => {
        if (error) {
          reject(error)
        }
        else {
          resolve()
        }
      })
    })
  }
}
