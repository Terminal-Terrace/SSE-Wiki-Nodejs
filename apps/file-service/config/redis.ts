import process from 'node:process'
import Redis from 'ioredis'

const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
const REDIS_PORT = Number.parseInt(process.env.REDIS_PORT || '6379', 10)
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || ''
const REDIS_DB = Number.parseInt(process.env.REDIS_DB || '0', 10)

export const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD || undefined,
  db: REDIS_DB,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
})

redisClient.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log('[file-service] Redis connected successfully')
})

redisClient.on('error', (err) => {
  console.error('[file-service] Redis connection error:', err)
})

// 优雅关闭
process.on('SIGINT', async () => {
  await redisClient.quit()
  // eslint-disable-next-line no-console
  console.log('[file-service] Redis connection closed')
})

// UploadSession 相关操作
export interface UploadSession {
  uploadId: string
  fileId: string
  ossKey: string
  fileHash: string
  fileName: string
  fileSize: number
  mimeType: string
  uploadedBy: string
  uploadedChunks: number[]
  createdAt: number
}

const UPLOAD_SESSION_PREFIX = 'upload:session:'
const UPLOAD_SESSION_TTL = 24 * 60 * 60 // 24小时

export async function setUploadSession(uploadId: string, session: UploadSession): Promise<void> {
  const key = `${UPLOAD_SESSION_PREFIX}${uploadId}`
  await redisClient.setex(key, UPLOAD_SESSION_TTL, JSON.stringify(session))
}

export async function getUploadSession(uploadId: string): Promise<UploadSession | null> {
  const key = `${UPLOAD_SESSION_PREFIX}${uploadId}`
  const data = await redisClient.get(key)
  return data ? JSON.parse(data) : null
}

export async function updateUploadedChunks(uploadId: string, partNumber: number): Promise<void> {
  const session = await getUploadSession(uploadId)
  if (!session)
    return

  if (!session.uploadedChunks.includes(partNumber)) {
    session.uploadedChunks.push(partNumber)
    await setUploadSession(uploadId, session)
  }
}

export async function deleteUploadSession(uploadId: string): Promise<void> {
  const key = `${UPLOAD_SESSION_PREFIX}${uploadId}`
  await redisClient.del(key)
}
