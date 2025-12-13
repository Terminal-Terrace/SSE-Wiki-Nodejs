import type { Metadata } from '@sse-wiki/rpc-client'
import type {
  GetReviewDetailRequest,
  GetReviewDetailResponse,
  GetReviewsRequest,
  GetReviewsResponse,
  ReviewActionRequest,
  ReviewActionResponse,
} from '../../protobuf/types/review_service'
import { getReviewClient } from '../wiki-grpc-client'

/**
 * Review Service - 封装 gRPC 调用
 * 用户信息通过 JWT metadata 传递
 */
export const reviewService = {
  /**
   * 获取审核列表
   */
  async getReviews(
    status: string = '',
    articleId: number = 0,
    metadata?: Metadata,
  ): Promise<GetReviewsResponse> {
    const req: GetReviewsRequest = {
      status,
      article_id: articleId,
    }
    return getReviewClient().GetReviews(req, metadata)
  },

  /**
   * 获取审核详情
   */
  async getReviewDetail(
    submissionId: number,
    metadata?: Metadata,
  ): Promise<GetReviewDetailResponse> {
    const req: GetReviewDetailRequest = { submission_id: submissionId }
    return getReviewClient().GetReviewDetail(req, metadata)
  },

  /**
   * 执行审核操作
   */
  async reviewAction(
    submissionId: number,
    action: string,
    notes: string,
    mergedContent: string,
    metadata?: Metadata,
  ): Promise<ReviewActionResponse> {
    const req: ReviewActionRequest = {
      submission_id: submissionId,
      action,
      notes,
      merged_content: mergedContent,
    }
    return getReviewClient().ReviewAction(req, metadata)
  },
}

export default reviewService
