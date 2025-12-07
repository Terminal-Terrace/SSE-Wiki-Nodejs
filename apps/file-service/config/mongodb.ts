import process from 'node:process'
import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sse-wiki'

export async function connectMongoDB() {
  try {
    await mongoose.connect(MONGO_URI)
    // eslint-disable-next-line no-console
    console.log('[file-service] MongoDB connected successfully')
  }
  catch (error) {
    console.error('[file-service] MongoDB connection failed:', error)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  // eslint-disable-next-line no-console
  console.log('[file-service] MongoDB connection closed')
  process.exit(0)
})
