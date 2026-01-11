import type { InitUploadParams } from './index'
import mongoose from 'mongoose'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import * as ossConfig from '../../config/oss'
import * as redisConfig from '../../config/redis'
import { FileModel } from '../../models/File'
import { batchInfo, completeUpload, getUploadPartUrl, initUpload } from './index'

// Mock OSS client
vi.mock('../../config/oss', () => ({
  ossClient: {
    initMultipartUpload: vi.fn(),
    listParts: vi.fn(),
    completeMultipartUpload: vi.fn(),
    signatureUrl: vi.fn(),
  },
  generateFileUrl: vi.fn(),
  generatePresignedPutUrl: vi.fn(),
}))

// Mock Redis
vi.mock('../../config/redis', () => ({
  setUploadSession: vi.fn(),
  getUploadSession: vi.fn(),
  deleteUploadSession: vi.fn(),
}))

describe('file Service', () => {
  beforeAll(async () => {
    // Connect to test MongoDB (skip if not available)
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27018/sse_wiki_test'
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      })
    }
    catch (error) {
      console.warn('MongoDB not available, skipping integration tests:', error)
    }
  })

  beforeEach(async () => {
    // Clear collections
    if (mongoose.connection.readyState !== 0) {
      await FileModel.deleteMany({})
    }

    // Reset mocks
    vi.clearAllMocks()
  })

  afterEach(async () => {
    // Clean up
    if (mongoose.connection.readyState !== 0) {
      await FileModel.deleteMany({})
    }
  })

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close()
    }
  })

  describe('initUpload', () => {
    const baseParams: InitUploadParams = {
      fileHash: 'test-hash-123',
      fileName: 'test.jpg',
      fileSize: 1024 * 1024, // 1MB
      mimeType: 'image/jpeg',
      uploadedBy: 'user123',
    }

    it.skipIf(mongoose.connection.readyState === 0)('should return existing file if already uploaded (秒传)', async () => {
      // Create an already uploaded file
      const existingFile = await FileModel.create({
        file_hash: baseParams.fileHash,
        file_name: baseParams.fileName,
        file_size: baseParams.fileSize,
        mime_type: baseParams.mimeType,
        oss_key: 'files/test-hash-123.jpg',
        status: 'uploaded',
        uploaded_by: baseParams.uploadedBy,
      })

      vi.mocked(ossConfig.generateFileUrl).mockReturnValue('https://example.com/files/test-hash-123.jpg')

      const result = await initUpload(baseParams)

      expect(result.exists).toBe(true)
      expect(result.fileId).toBe(existingFile._id.toString())
      expect(result.url).toBe('https://example.com/files/test-hash-123.jpg')
      expect(result.uploadId).toBeUndefined()
    })

    it.skipIf(mongoose.connection.readyState === 0)('should create new upload session if file not exists', async () => {
      vi.mocked(ossConfig.ossClient.initMultipartUpload).mockResolvedValue({
        uploadId: 'test-upload-id-123',
      } as any)
      vi.mocked(redisConfig.setUploadSession).mockResolvedValue(undefined)

      const result = await initUpload(baseParams)

      expect(result.exists).toBe(false)
      expect(result.uploadId).toBe('test-upload-id-123')
      expect(result.fileId).toBeUndefined()

      // Verify file was created
      const file = await FileModel.findOne({ file_hash: baseParams.fileHash })
      expect(file).toBeTruthy()
      expect(file?.status).toBe('uploading')
      expect(file?.file_name).toBe(baseParams.fileName)

      // Verify session was set
      expect(redisConfig.setUploadSession).toHaveBeenCalled()
    })

    it.skipIf(mongoose.connection.readyState === 0)('should reuse existing uploading file if found', async () => {
      // Create an uploading file
      const uploadingFile = await FileModel.create({
        file_hash: baseParams.fileHash,
        file_name: baseParams.fileName,
        file_size: baseParams.fileSize,
        mime_type: baseParams.mimeType,
        oss_key: 'files/test-hash-123.jpg',
        status: 'uploading',
        uploaded_by: baseParams.uploadedBy,
      })

      vi.mocked(ossConfig.ossClient.initMultipartUpload).mockResolvedValue({
        uploadId: 'test-upload-id-456',
      } as any)
      vi.mocked(redisConfig.setUploadSession).mockResolvedValue(undefined)

      const result = await initUpload(baseParams)

      expect(result.exists).toBe(false)
      expect(result.uploadId).toBe('test-upload-id-456')

      // Verify no new file was created
      const files = await FileModel.find({ file_hash: baseParams.fileHash })
      expect(files.length).toBe(1)
      expect(files[0]._id.toString()).toBe(uploadingFile._id.toString())
    })

    it.skipIf(mongoose.connection.readyState === 0)('should throw error if file size exceeds limit', async () => {
      const largeParams: InitUploadParams = {
        ...baseParams,
        fileSize: 200 * 1024 * 1024, // 200MB (assuming MAX_FILE_SIZE_MB = 100)
      }

      await expect(initUpload(largeParams)).rejects.toThrow()
    })
  })

  describe('getUploadPartUrl', () => {
    it.skipIf(mongoose.connection.readyState === 0)('should return presigned URL for upload part', async () => {
      const uploadId = 'test-upload-id-123'
      const session = {
        uploadId,
        fileId: 'test-file-id',
        ossKey: 'files/test-hash-123.jpg',
        fileHash: 'test-hash-123',
        fileName: 'test.jpg',
        fileSize: 1024 * 1024,
        mimeType: 'image/jpeg',
        uploadedBy: 'user123',
        uploadedChunks: [],
        createdAt: Date.now(),
      }

      vi.mocked(redisConfig.getUploadSession).mockResolvedValue(session)
      vi.mocked(ossConfig.generatePresignedPutUrl).mockResolvedValue('https://example.com/upload/part1')

      const result = await getUploadPartUrl({
        uploadId,
        partNumber: 1,
      })

      expect(result.url).toBe('https://example.com/upload/part1')
      expect(ossConfig.generatePresignedPutUrl).toHaveBeenCalledWith(
        session.ossKey,
        uploadId,
        1,
      )
    })

    it.skipIf(mongoose.connection.readyState === 0)('should throw error if session not found', async () => {
      vi.mocked(redisConfig.getUploadSession).mockResolvedValue(null)

      await expect(getUploadPartUrl({
        uploadId: 'non-existent-upload-id',
        partNumber: 1,
      })).rejects.toThrow()
    })
  })

  describe('completeUpload', () => {
    it.skipIf(mongoose.connection.readyState === 0)('should complete upload and update file status', async () => {
      const uploadId = 'test-upload-id-123'
      const fileId = new mongoose.Types.ObjectId()

      const session = {
        uploadId,
        fileId: fileId.toString(),
        ossKey: 'files/test-hash-123.jpg',
        fileHash: 'test-hash-123',
        fileName: 'test.jpg',
        fileSize: 1024 * 1024,
        mimeType: 'image/jpeg',
        uploadedBy: 'user123',
        uploadedChunks: [],
        createdAt: Date.now(),
      }

      await FileModel.create({
        _id: fileId,
        file_hash: 'test-hash-123',
        file_name: 'test.jpg',
        file_size: 1024 * 1024,
        mime_type: 'image/jpeg',
        oss_key: 'files/test-hash-123.jpg',
        status: 'uploading',
        uploaded_by: 'user123',
      })

      vi.mocked(redisConfig.getUploadSession).mockResolvedValue(session)
      vi.mocked(ossConfig.ossClient.listParts).mockResolvedValue({
        parts: [
          { PartNumber: 1, ETag: 'etag1' },
          { PartNumber: 2, ETag: 'etag2' },
        ],
      } as any)
      vi.mocked(ossConfig.ossClient.completeMultipartUpload).mockResolvedValue({} as any)
      vi.mocked(ossConfig.generateFileUrl).mockReturnValue('https://example.com/files/test-hash-123.jpg')
      vi.mocked(redisConfig.deleteUploadSession).mockResolvedValue(undefined)

      const result = await completeUpload({ uploadId })

      expect(result.fileId).toBe(fileId.toString())
      expect(result.url).toBe('https://example.com/files/test-hash-123.jpg')

      // Verify file status was updated
      const updatedFile = await FileModel.findById(fileId)
      expect(updatedFile?.status).toBe('uploaded')

      // Verify session was deleted
      expect(redisConfig.deleteUploadSession).toHaveBeenCalledWith(uploadId)
    })

    it.skipIf(mongoose.connection.readyState === 0)('should handle single part upload', async () => {
      const uploadId = 'test-upload-id-123'
      const fileId = new mongoose.Types.ObjectId()

      const session = {
        uploadId,
        fileId: fileId.toString(),
        ossKey: 'files/test-hash-123.jpg',
        fileHash: 'test-hash-123',
        fileName: 'test.jpg',
        fileSize: 1024 * 1024,
        mimeType: 'image/jpeg',
        uploadedBy: 'user123',
        uploadedChunks: [],
        createdAt: Date.now(),
      }

      await FileModel.create({
        _id: fileId,
        file_hash: 'test-hash-123',
        file_name: 'test.jpg',
        file_size: 1024 * 1024,
        mime_type: 'image/jpeg',
        oss_key: 'files/test-hash-123.jpg',
        status: 'uploading',
        uploaded_by: 'user123',
      })

      // Single part (ali-oss returns object instead of array)
      vi.mocked(redisConfig.getUploadSession).mockResolvedValue(session)
      vi.mocked(ossConfig.ossClient.listParts).mockResolvedValue({
        PartNumber: 1,
        ETag: 'etag1',
      } as any)
      vi.mocked(ossConfig.ossClient.completeMultipartUpload).mockResolvedValue({} as any)
      vi.mocked(ossConfig.generateFileUrl).mockReturnValue('https://example.com/files/test-hash-123.jpg')
      vi.mocked(redisConfig.deleteUploadSession).mockResolvedValue(undefined)

      const result = await completeUpload({ uploadId })

      expect(result.fileId).toBe(fileId.toString())
      expect(ossConfig.ossClient.completeMultipartUpload).toHaveBeenCalledWith(
        session.ossKey,
        uploadId,
        [{ number: 1, etag: 'etag1' }],
      )
    })

    it.skipIf(mongoose.connection.readyState === 0)('should throw error if session not found', async () => {
      vi.mocked(redisConfig.getUploadSession).mockResolvedValue(null)

      await expect(completeUpload({ uploadId: 'non-existent-upload-id' })).rejects.toThrow()
    })

    it.skipIf(mongoose.connection.readyState === 0)('should throw error if file not found', async () => {
      const uploadId = 'test-upload-id-123'
      const session = {
        uploadId,
        fileId: new mongoose.Types.ObjectId().toString(),
        ossKey: 'files/test-hash-123.jpg',
        fileHash: 'test-hash-123',
        fileName: 'test.jpg',
        fileSize: 1024 * 1024,
        mimeType: 'image/jpeg',
        uploadedBy: 'user123',
        uploadedChunks: [],
        createdAt: Date.now(),
      }

      vi.mocked(redisConfig.getUploadSession).mockResolvedValue(session)

      await expect(completeUpload({ uploadId })).rejects.toThrow()
    })
  })

  describe('batchInfo', () => {
    it.skipIf(mongoose.connection.readyState === 0)('should return file info for existing files', async () => {
      const file1 = await FileModel.create({
        file_hash: 'hash1',
        file_name: 'file1.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        oss_key: 'files/hash1.jpg',
        status: 'uploaded',
        uploaded_by: 'user123',
      })

      const file2 = await FileModel.create({
        file_hash: 'hash2',
        file_name: 'file2.pdf',
        file_size: 2048,
        mime_type: 'application/pdf',
        oss_key: 'files/hash2.pdf',
        status: 'uploaded',
        uploaded_by: 'user123',
      })

      vi.mocked(ossConfig.generateFileUrl).mockImplementation((key: string) => `https://example.com/${key}`)

      const result = await batchInfo({
        fileIds: [file1._id.toString(), file2._id.toString()],
      })

      expect(result.files).toHaveLength(2)
      expect(result.files[0].id).toBe(file1._id.toString())
      expect(result.files[0].name).toBe('file1.jpg')
      expect(result.files[0].category).toBe('image')
      expect(result.files[0].missing).toBe(false)

      expect(result.files[1].id).toBe(file2._id.toString())
      expect(result.files[1].name).toBe('file2.pdf')
      expect(result.files[1].category).toBe('document')
      expect(result.files[1].missing).toBe(false)
    })

    it.skipIf(mongoose.connection.readyState === 0)('should return missing flag for non-existent files', async () => {
      const file1 = await FileModel.create({
        file_hash: 'hash1',
        file_name: 'file1.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        oss_key: 'files/hash1.jpg',
        status: 'uploaded',
        uploaded_by: 'user123',
      })

      const nonExistentId = new mongoose.Types.ObjectId().toString()

      const result = await batchInfo({
        fileIds: [file1._id.toString(), nonExistentId],
      })

      expect(result.files).toHaveLength(2)
      expect(result.files[0].missing).toBe(false)
      expect(result.files[1].missing).toBe(true)
      expect(result.files[1].id).toBe(nonExistentId)
      expect(result.files[1].name).toBe('')
    })

    it.skipIf(mongoose.connection.readyState === 0)('should return empty array for empty fileIds', async () => {
      const result = await batchInfo({ fileIds: [] })

      expect(result.files).toHaveLength(0)
    })

    it.skipIf(mongoose.connection.readyState === 0)('should correctly categorize files', async () => {
      const testCases = [
        { mimeType: 'image/png', expectedCategory: 'image' },
        { mimeType: 'video/mp4', expectedCategory: 'video' },
        { mimeType: 'audio/mpeg', expectedCategory: 'audio' },
        { mimeType: 'application/zip', expectedCategory: 'archive' },
        { mimeType: 'application/javascript', expectedCategory: 'code' },
        { mimeType: 'application/pdf', expectedCategory: 'document' },
        { mimeType: 'application/octet-stream', expectedCategory: 'other' },
      ]

      for (const testCase of testCases) {
        const file = await FileModel.create({
          file_hash: `hash-${testCase.mimeType}`,
          file_name: `file.${testCase.mimeType.split('/')[1]}`,
          file_size: 1024,
          mime_type: testCase.mimeType,
          oss_key: `files/hash-${testCase.mimeType}`,
          status: 'uploaded',
          uploaded_by: 'user123',
        })

        vi.mocked(ossConfig.generateFileUrl).mockReturnValue(`https://example.com/files/hash-${testCase.mimeType}`)

        const result = await batchInfo({ fileIds: [file._id.toString()] })

        expect(result.files[0].category).toBe(testCase.expectedCategory)
      }
    })
  })
})
