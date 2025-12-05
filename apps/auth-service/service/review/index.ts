import type {
  GetReviewDetailRequest,
  GetReviewDetailResponse,
  GetReviewsRequest,
  GetReviewsResponse,
  ReviewActionRequest,
  ReviewActionResponse,
} from '../../protobuf/types/ssewiki'
import { getReviewClient } from '../wiki-grpc-client'

/**
 * Review Service - 封装 gRPC 调用
 */
export const reviewService = {
  /**
   * 获取审核列表
   */
  async getReviews(
    status: string = '',
    articleId: number = 0,
  ): Promise<GetReviewsResponse> {
    const req: GetReviewsRequest = {
      status,
      article_id: articleId,
    }
    return getReviewClient().GetReviews(req)
  },

  /**
   * 获取审核详情
   */
  async getReviewDetail(
    submissionId: number,
    userId: number,
    userRole: string,
  ): Promise<GetReviewDetailResponse> {
    const req: GetReviewDetailRequest = {
      submission_id: submissionId,
      user_id: userId,
      user_role: userRole,
    }
    return getReviewClient().GetReviewDetail(req)
  },

  /**
   * 执行审核操作
   */
  async reviewAction(
    submissionId: number,
    action: string,
    notes: string,
    mergedContent: string,
    reviewerId: number,
    userRole: string,
  ): Promise<ReviewActionResponse> {
    const req: ReviewActionRequest = {
      submission_id: submissionId,
      action,
      notes,
      merged_content: mergedContent,
      reviewer_id: reviewerId,
      user_role: userRole,
    }
    return getReviewClient().ReviewAction(req)
  },
}

export default reviewService
