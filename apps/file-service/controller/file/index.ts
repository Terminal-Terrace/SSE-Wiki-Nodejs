import type { Context } from 'koa'
import { fileService } from '../../service/file'
import { validate } from '../../utils/validate'
import {
  batchInfoSchema,
  completeUploadSchema,
  initUploadSchema,
  signUploadSchema,
} from './schema'

class FileController {
  async initUpload(ctx: Context) {
    const body = validate(ctx, initUploadSchema, 'body')

    const rawUser = (ctx.state as any)?.user || (ctx as any).user
    const uploadedBy
      = rawUser?.user_id?.toString?.()
        || rawUser?.userId?.toString?.()
        || 'anonymous'

    const result = await fileService.initUpload({
      fileHash: body.fileHash,
      fileName: body.fileName,
      fileSize: body.fileSize,
      mimeType: body.mimeType,
      uploadedBy,
    })

    ctx.success(result)
  }

  async signUpload(ctx: Context) {
    const body = validate(ctx, signUploadSchema, 'body')

    const result = await fileService.getUploadPartUrl({
      uploadId: body.uploadId,
      partNumber: body.partNumber,
    })

    ctx.success(result)
  }

  async completeUpload(ctx: Context) {
    const body = validate(ctx, completeUploadSchema, 'body')

    const result = await fileService.completeUpload({
      uploadId: body.uploadId,
    })

    ctx.success(result)
  }

  async batchInfo(ctx: Context) {
    const body = validate(ctx, batchInfoSchema, 'body')

    const result = await fileService.batchInfo({
      fileIds: body.fileIds,
    })

    ctx.success(result)
  }
}

export const fileController = new FileController()

export default fileController
