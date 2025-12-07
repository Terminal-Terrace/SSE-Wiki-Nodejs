import { z } from 'zod'

export const initUploadSchema = z.object({
  fileHash: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1),
})

export const signUploadSchema = z.object({
  uploadId: z.string().min(1),
  partNumber: z.number().int().positive(),
})

export const completeUploadSchema = z.object({
  uploadId: z.string().min(1),
})

export const batchInfoSchema = z.object({
  fileIds: z.array(z.string().min(1)),
})

export type InitUploadInput = z.infer<typeof initUploadSchema>
export type SignUploadInput = z.infer<typeof signUploadSchema>
export type CompleteUploadInput = z.infer<typeof completeUploadSchema>
export type BatchInfoInput = z.infer<typeof batchInfoSchema>
