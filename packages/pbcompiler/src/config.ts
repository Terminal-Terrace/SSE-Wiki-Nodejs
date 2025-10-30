import fs from 'node:fs'
import path from 'node:path'

/**
 * pb.config.json 配置文件格式
 */
export interface PbConfig {
  /** 服务名列表 */
  services: string[]
  /** gRPC 服务器地址，默认 'localhost:50051' */
  serverAddress?: string
}

/**
 * 固定的生成目录
 * proto 文件和生成的 ts 文件都放在这里
 */
const PROTOBUF_DIR = './protobuf'

/**
 * 配置管理器
 */
export class ConfigManager {
  private config: PbConfig
  private configPath: string
  private baseDir: string

  constructor(configPath = './pb.config.json') {
    this.configPath = path.resolve(configPath)
    this.baseDir = path.dirname(this.configPath)

    if (!fs.existsSync(this.configPath)) {
      throw new Error(`Config file not found: ${this.configPath}`)
    }

    const content = fs.readFileSync(this.configPath, 'utf-8')
    this.config = JSON.parse(content)

    // 设置默认值
    this.config.serverAddress = this.config.serverAddress || 'localhost:50051'
  }

  /**
   * 获取配置
   */
  getConfig(): PbConfig {
    return this.config
  }

  /**
   * 根据服务名获取 proto 文件路径
   * 约定：服务名 "user" 对应 protobuf/user/user.proto
   */
  getProtoPath(serviceName: string): string {
    const protobufDir = path.resolve(this.baseDir, PROTOBUF_DIR)
    const serviceDir = serviceName.toLowerCase()
    const protoFile = `${serviceName.toLowerCase()}.proto`
    return path.join(protobufDir, serviceDir, protoFile)
  }

  /**
   * 根据服务名获取 package 名
   * 约定：服务名就是 package 名（小写）
   */
  getPackageName(serviceName: string): string {
    return serviceName.toLowerCase()
  }

  /**
   * 根据服务名获取 Service 类名
   * 约定：服务名 "user" 对应 "UserService"
   */
  getServiceClassName(serviceName: string): string {
    const capitalized = serviceName.charAt(0).toUpperCase() + serviceName.slice(1)
    return `${capitalized}Service`
  }

  /**
   * 获取 gRPC 服务器地址
   */
  getServerAddress(): string {
    return this.config.serverAddress!
  }

  /**
   * 获取输出目录（protobuf 根目录）
   */
  getOutputDir(): string {
    return path.resolve(this.baseDir, PROTOBUF_DIR)
  }

  /**
   * 获取 types 目录路径
   */
  getTypesDir(): string {
    return path.join(this.getOutputDir(), 'types')
  }

  /**
   * 获取服务目录路径
   * @param serviceName 服务名
   */
  getServiceDir(serviceName: string): string {
    return path.join(this.getOutputDir(), serviceName.toLowerCase())
  }
}

/**
 * 全局配置实例
 */
let globalConfig: ConfigManager | null = null

/**
 * 初始化全局配置
 */
export function initConfig(configPath?: string): ConfigManager {
  globalConfig = new ConfigManager(configPath)
  return globalConfig
}

/**
 * 获取全局配置
 */
export function getConfig(): ConfigManager {
  if (!globalConfig) {
    globalConfig = new ConfigManager()
  }
  return globalConfig
}
