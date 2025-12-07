import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

export interface IFile extends Document {
  _id: mongoose.Types.ObjectId
  file_hash: string
  file_name: string
  file_size: number
  mime_type: string
  oss_key: string
  status: 'uploading' | 'uploaded' | 'failed'
  uploaded_by: string
  parse_status: 'pending' | 'parsing' | 'parsed' | 'failed'
  created_at: Date
  updated_at: Date
}

const FileSchema = new Schema<IFile>(
  {
    file_hash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    file_name: {
      type: String,
      required: true,
    },
    file_size: {
      type: Number,
      required: true,
    },
    mime_type: {
      type: String,
      required: true,
    },
    oss_key: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['uploading', 'uploaded', 'failed'],
      default: 'uploading',
      index: true,
    },
    uploaded_by: {
      type: String,
      required: true,
      index: true,
    },
    parse_status: {
      type: String,
      enum: ['pending', 'parsing', 'parsed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

// 复合索引：用于清理脏数据
FileSchema.index({ status: 1, created_at: 1 })

export const FileModel = mongoose.model<IFile>('File', FileSchema)
