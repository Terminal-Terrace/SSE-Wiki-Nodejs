import type { UploadSession } from '../../config/redis'
import type { IFile } from '../../models/File'
import process from 'node:process'
import { LogicError } from '@sse-wiki/error'
import { generateFileUrl, generatePresignedPutUrl, ossClient } from '../../config/oss'
import { deleteUploadSession, getUploadSession, setUploadSession } from '../../config/redis'
import { ErrorCode } from '../../error'
import { FileModel } from '../../models/File'

const MAX_FILE_SIZE_MB = Number.parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10)
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'code' | 'other'

export interface InitUploadParams {
  fileHash: string
  fileName: string
  fileSize: number
  mimeType: string
  uploadedBy: string
}

export interface InitUploadResult {
  exists: boolean
  fileId?: string
  uploadId?: string
  url?: string
}

export interface SignUploadParams {
  uploadId: string
  partNumber: number
}

export interface SignUploadResult {
  url: string
}

export interface CompleteUploadParams {
  uploadId: string
}

export interface CompleteUploadResult {
  fileId: string
  url: string
}

export interface BatchInfoParams {
  fileIds: string[]
}

export interface BatchInfoItem {
  id: string
  name: string
  size: number
  mimeType: string
  url: string
  category: FileCategory
  missing: boolean
}

function buildOssKey(fileHash: string, fileName: string): string {
  const idx = fileName.lastIndexOf('.')
  const ext = idx >= 0 ? fileName.slice(idx + 1) : ''
  if (ext)
    return `files/${fileHash}.${ext}`
  return `files/${fileHash}`
}

function getFileCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith('image/'))
    return 'image'
  if (mimeType.startsWith('video/'))
    return 'video'
  if (mimeType.startsWith('audio/'))
    return 'audio'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z') || mimeType.includes('tar'))
    return 'archive'
  if (
    mimeType.includes('javascript')
    || mimeType.includes('json')
    || mimeType.includes('xml')
    || mimeType.includes('typescript')
    || mimeType.includes('python')
    || mimeType.includes('java')
  ) {
    return 'code'
  }
  if (
    mimeType.includes('pdf')
    || mimeType.includes('word')
    || mimeType.includes('document')
    || mimeType.includes('text')
    || mimeType.includes('spreadsheet')
    || mimeType.includes('presentation')
  ) {
    return 'document'
  }
  return 'other'
}

async function findUploadedFileByHash(fileHash: string): Promise<IFile | null> {
  return FileModel.findOne({ file_hash: fileHash, status: 'uploaded' }).exec()
}

async function findUploadingFileByHash(fileHash: string): Promise<IFile | null> {
  return FileModel.findOne({ file_hash: fileHash, status: 'uploading' }).exec()
}

async function createUploadingFile(params: InitUploadParams, ossKey: string): Promise<IFile> {
  const { fileHash, fileName, fileSize, mimeType, uploadedBy } = params
  const file = await FileModel.create({
    file_hash: fileHash,
    file_name: fileName,
    file_size: fileSize,
    mime_type: mimeType,
    oss_key: ossKey,
    status: 'uploading',
    uploaded_by: uploadedBy,
    parse_status: 'pending',
  })
  return file
}

export async function initUpload(params: InitUploadParams): Promise<InitUploadResult> {
  const { fileHash, fileName, fileSize, mimeType } = params
  const uploadedBy = params.uploadedBy || 'anonymous'

  if (fileSize > MAX_FILE_SIZE_BYTES)
    throw new LogicError(ErrorCode.INVALID_PARAMS)

  // 1. 检查是否已经上传完成（秒传）
  const uploaded = await findUploadedFileByHash(fileHash)
  if (uploaded) {
    const url = generateFileUrl(uploaded.oss_key)
    return {
      exists: true,
      fileId: uploaded._id.toString(),
      url,
    }
  }

  // 2. 检查是否有未完成的上传记录（复用或重新开始）
  let file = await findUploadingFileByHash(fileHash)
  const ossKey = buildOssKey(fileHash, fileName)

  if (!file) {
    // 2.1 没有记录，创建新的
    file = await createUploadingFile({
      fileHash,
      fileName,
      fileSize,
      mimeType,
      uploadedBy,
    }, ossKey)
  }

  // 3. 初始化 OSS multipart upload（每次都生成新的 uploadId）
  const res = await ossClient.initMultipartUpload(ossKey)
  const uploadId = res.uploadId as string

  const session: UploadSession = {
    uploadId,
    fileId: file._id.toString(),
    ossKey,
    fileHash,
    fileName,
    fileSize,
    mimeType,
    uploadedBy,
    uploadedChunks: [],
    createdAt: Date.now(),
  }

  await setUploadSession(uploadId, session)

  return {
    exists: false,
    uploadId,
  }
}

export async function getUploadPartUrl(params: SignUploadParams): Promise<SignUploadResult> {
  const { uploadId, partNumber } = params

  const session = await getUploadSession(uploadId)
  if (!session)
    throw new LogicError(ErrorCode.INVALID_PARAMS)

  const url = await generatePresignedPutUrl(session.ossKey, uploadId, partNumber)

  return { url }
}

export async function completeUpload(params: CompleteUploadParams): Promise<CompleteUploadResult> {
  const { uploadId } = params

  const session = await getUploadSession(uploadId)
  if (!session)
    throw new LogicError(ErrorCode.INVALID_PARAMS)

  const file = await FileModel.findById(session.fileId).exec()
  if (!file)
    throw new LogicError(ErrorCode.UNKNOWN)

  const listResult: any = await ossClient.listParts(session.ossKey, uploadId)

  let rawParts: any = listResult && (listResult.parts ?? listResult.Parts)

  if (!rawParts) {
    rawParts = []
  }
  else if (Array.isArray(rawParts)) {
    // already an array, do nothing
  }
  else if (typeof rawParts === 'object' && 'PartNumber' in rawParts && ('ETag' in rawParts || 'etag' in rawParts)) {
    // ali-oss 在只有一个分片时会返回单个对象，这里包一层数组
    rawParts = [rawParts]
  }
  else {
    // 兜底：如果是以分片号为 key 的对象，取 values
    rawParts = Object.values(rawParts)
  }

  const formattedParts: Array<{ number: number, etag: string }> = (rawParts as any[]).map((p: any, index: number) => ({
    number: Number(p.PartNumber ?? p.partNumber ?? p.number ?? (index + 1)),
    etag: p.ETag ?? p.etag,
  }))

  await ossClient.completeMultipartUpload(session.ossKey, uploadId, formattedParts)

  file.status = 'uploaded'
  await file.save()

  await deleteUploadSession(uploadId)

  const url = generateFileUrl(session.ossKey)

  return {
    fileId: file._id.toString(),
    url,
  }
}

export async function batchInfo(params: BatchInfoParams): Promise<{ files: BatchInfoItem[] }> {
  const { fileIds } = params

  if (!fileIds.length)
    return { files: [] }

  const docs = await FileModel.find({ _id: { $in: fileIds } }).exec()
  const map = new Map<string, IFile>()
  for (const doc of docs)
    map.set(doc._id.toString(), doc)

  const files: BatchInfoItem[] = fileIds.map((id) => {
    const doc = map.get(id)
    if (!doc) {
      return {
        id,
        name: '',
        size: 0,
        mimeType: '',
        url: '',
        category: 'other',
        missing: true,
      }
    }

    return {
      id: doc._id.toString(),
      name: doc.file_name,
      size: doc.file_size,
      mimeType: doc.mime_type,
      url: generateFileUrl(doc.oss_key),
      category: getFileCategory(doc.mime_type),
      missing: false,
    }
  })

  return { files }
}

export const fileService = {
  initUpload,
  getUploadPartUrl,
  completeUpload,
  batchInfo,
}
