import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

/**
 * 全局认证配置格式
 * 存储在 ~/.config/cpb/config.json
 */
export interface AuthConfig {
  /** GitHub Personal Access Token */
  githubToken?: string
  /** GitHub 仓库所有者 (organization 或 username) */
  repoOwner?: string
  /** GitHub 仓库名 */
  repoName?: string
  /** proto 文件在仓库中的目录路径，默认为根目录 */
  protoDir?: string
}

/**
 * 获取配置目录路径
 * 遵循 XDG Base Directory 规范
 */
function getConfigDir(): string {
  // 优先使用 XDG_CONFIG_HOME 环境变量
  const xdgConfigHome = process.env.XDG_CONFIG_HOME
  const configHome = xdgConfigHome || path.join(os.homedir(), '.config')
  return path.join(configHome, 'cpb')
}

/**
 * 全局配置文件路径
 */
function getAuthConfigPath(): string {
  return path.join(getConfigDir(), 'config.json')
}

/**
 * 读取认证配置
 */
export function readAuthConfig(): AuthConfig {
  const configPath = getAuthConfigPath()

  if (!fs.existsSync(configPath)) {
    return {}
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8')
    return JSON.parse(content)
  }
  catch (error) {
    console.error('读取认证配置失败:', error)
    return {}
  }
}

/**
 * 写入认证配置
 */
export function writeAuthConfig(config: AuthConfig): void {
  const configDir = getConfigDir()
  const configPath = getAuthConfigPath()

  try {
    // 确保配置目录存在
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
  }
  catch (error) {
    console.error('写入认证配置失败:', error)
    throw error
  }
}

/**
 * 更新认证配置（合并更新）
 */
export function updateAuthConfig(updates: Partial<AuthConfig>): void {
  const current = readAuthConfig()
  const updated = { ...current, ...updates }
  writeAuthConfig(updated)
}

/**
 * 获取 GitHub Token
 */
export function getGithubToken(): string | undefined {
  const config = readAuthConfig()
  return config.githubToken
}

/**
 * 获取仓库配置
 */
export function getRepoConfig(): { owner?: string, name?: string, protoDir?: string } {
  const config = readAuthConfig()
  return {
    owner: config.repoOwner,
    name: config.repoName,
    protoDir: config.protoDir || '',
  }
}

/**
 * 检查配置是否完整
 */
export function validateAuthConfig(): { valid: boolean, missing: string[] } {
  const config = readAuthConfig()
  const missing: string[] = []

  if (!config.githubToken) {
    missing.push('GitHub Token')
  }
  if (!config.repoOwner) {
    missing.push('Repository Owner')
  }
  if (!config.repoName) {
    missing.push('Repository Name')
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}
