import { Buffer } from 'node:buffer'
import { getGithubToken, getRepoConfig, validateAuthConfig } from './auth-config'
import { ensureDir } from './utils'

/**
 * Proto 文件下载器
 * 通过 GitHub API 从指定仓库下载 proto 文件
 */

/**
 * GitHub API 响应类型
 */
interface GitHubFileResponse {
  content: string
  encoding: string
  name: string
  path: string
  sha: string
  size: number
}

/**
 * 下载指定服务的 proto 文件
 *
 * @param serviceName 服务名，如 "user"
 * @returns proto 文件内容（字符串）
 *
 * @example
 * const protoContent = await downloadProtoFile('user')
 */
export async function downloadProtoFile(serviceName: string): Promise<string> {
  // 1. 验证配置
  const validation = validateAuthConfig()
  if (!validation.valid) {
    throw new Error(
      `GitHub 配置不完整，缺少: ${validation.missing.join(', ')}\n`
      + '请先配置:\n'
      + '  1. cpb login <github-token>\n'
      + '  2. cpb config --owner <owner> --repo <repo>',
    )
  }

  // 2. 获取配置
  const token = getGithubToken()!
  const { owner, name: repo, protoDir } = getRepoConfig()

  // 3. 构建文件路径和 API URL
  // 创建目录
  ensureDir(serviceName.toLowerCase())
  const fileName = `${serviceName.toLowerCase()}/${serviceName.toLowerCase()}.proto`
  const filePath = protoDir ? `${protoDir}/${fileName}` : fileName
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`

  try {
    // 4. 发送 GitHub API 请求
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'cpb-cli',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Proto 文件未找到: ${filePath}\n`
          + `仓库: ${owner}/${repo}\n`
          + '请检查:\n'
          + '  1. 文件路径是否正确\n'
          + '  2. 仓库配置是否正确 (使用 "cpb config --show" 查看)',
        )
      }
      else if (response.status === 401) {
        throw new Error(
          'GitHub Token 认证失败\n'
          + '请检查:\n'
          + '  1. Token 是否正确\n'
          + '  2. Token 是否有读取仓库的权限\n'
          + '使用 "cpb login <token>" 重新配置',
        )
      }
      else {
        const errorText = await response.text()
        throw new Error(`GitHub API 请求失败 (${response.status}): ${errorText}`)
      }
    }

    // 5. 解析响应
    const data = await response.json() as GitHubFileResponse

    // 6. 解码文件内容 (GitHub API 返回 base64 编码的内容)
    if (data.encoding !== 'base64') {
      throw new Error(`不支持的编码格式: ${data.encoding}`)
    }

    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    return content
  }
  catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`下载 proto 文件失败: ${String(error)}`)
  }
}

/**
 * 批量下载多个服务的 proto 文件
 *
 * @param serviceNames 服务名列表
 * @returns Map<serviceName, protoContent>
 */
export async function downloadProtoFiles(serviceNames: string[]): Promise<Map<string, string>> {
  const results = new Map<string, string>()

  for (const serviceName of serviceNames) {
    const content = await downloadProtoFile(serviceName)
    results.set(serviceName, content)
  }

  return results
}
