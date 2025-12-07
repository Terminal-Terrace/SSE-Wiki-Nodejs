import process from 'node:process'
import OSS from 'ali-oss'

const OSS_REGION = process.env.OSS_REGION || 'oss-cn-guangzhou'
const OSS_BUCKET = process.env.OSS_BUCKET || 'sse-wiki'
const OSS_ACCESS_KEY_ID = process.env.OSS_ACCESS_KEY_ID || ''
const OSS_ACCESS_KEY_SECRET = process.env.OSS_ACCESS_KEY_SECRET || ''
const OSS_ENDPOINT = process.env.OSS_ENDPOINT || ''

if (!OSS_BUCKET || !OSS_ACCESS_KEY_ID || !OSS_ACCESS_KEY_SECRET) {
  console.error('[file-service] OSS configuration is incomplete')
}

export const ossClient = new OSS({
  region: OSS_REGION,
  bucket: OSS_BUCKET,
  accessKeyId: OSS_ACCESS_KEY_ID,
  accessKeySecret: OSS_ACCESS_KEY_SECRET,
  endpoint: OSS_ENDPOINT || undefined,
  secure: true,
})

/**
 * 生成分片上传的预签名 PUT URL
 * @param ossKey OSS 对象键
 * @param uploadId OSS Multipart Upload 的 uploadId
 * @param partNumber 分片序号，从 1 开始
 * @param expires 过期时间（秒），默认 1 小时
 */
export async function generatePresignedPutUrl(
  ossKey: string,
  uploadId: string,
  partNumber: number,
  expires = 3600,
): Promise<string> {
  const url = ossClient.signatureUrl(ossKey, {
    'method': 'PUT',
    expires,
    'Content-Type': 'application/octet-stream',
    'subResource': {
      uploadId,
      partNumber,
    },
  })
  return url
}

/**
 * 生成文件访问 URL（预签名 GET URL，用于私有 bucket）
 * @param ossKey OSS 对象键
 * @param expires 过期时间（秒），默认 7 天
 */
export function generateFileUrl(ossKey: string, expires = 7 * 24 * 3600): string {
  // 如果配置了自定义 endpoint（如 CDN），且 bucket 是公开的，直接拼接
  if (OSS_ENDPOINT) {
    return `${OSS_ENDPOINT}/${ossKey}`
  }

  // 生成预签名 GET URL（适用于私有 bucket）
  const url = ossClient.signatureUrl(ossKey, {
    method: 'GET',
    expires,
  })
  return url
}

/**
 * 检查文件是否存在
 * @param ossKey OSS 对象键
 */
export async function checkFileExists(ossKey: string): Promise<boolean> {
  try {
    await ossClient.head(ossKey)
    return true
  }
  catch (error: any) {
    if (error.code === 'NoSuchKey') {
      return false
    }
    throw error
  }
}

/**
 * 删除 OSS 文件
 * @param ossKey OSS 对象键
 */
export async function deleteFile(ossKey: string): Promise<void> {
  await ossClient.delete(ossKey)
}
