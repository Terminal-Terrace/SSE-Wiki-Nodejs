/**
 * Proto 文件下载器
 *
 * TODO: 实现从远程服务器下载 proto 文件的逻辑
 */

/**
 * 下载指定服务的 proto 文件
 *
 * @param serviceName 服务名，如 "user"
 * @returns proto 文件内容（字符串）
 *
 * @example
 * const protoContent = await downloadProtoFile('user')
 *
 * TODO: 实现方案建议
 * 1. 从配置中获取 proto 文件的远程仓库地址
 * 2. 根据服务名构建下载 URL
 * 3. 使用 fetch/axios 下载文件
 * 4. 返回文件内容
 */
export async function downloadProtoFile(serviceName: string): Promise<string> {
  // TODO: 实现下载逻辑
  throw new Error(
    `downloadProtoFile not implemented yet. Service: ${serviceName}\n`
    + 'Please implement this function to download proto files from your remote repository.',
  )
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
