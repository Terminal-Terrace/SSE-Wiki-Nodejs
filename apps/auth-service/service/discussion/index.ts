import type {
  CreateCommentRequest,
  CreateCommentResponse,
  DeleteCommentRequest,
  DeleteCommentResponse,
  GetArticleCommentsRequest,
  GetArticleCommentsResponse,
  ReplyCommentRequest,
  ReplyCommentResponse,
  UpdateCommentRequest,
  UpdateCommentResponse,
} from '../../protobuf/types/discussion_service'
import { getDiscussionClient } from '../wiki-grpc-client'

/**
 * Discussion Service - 封装 gRPC 调用
 */
export const discussionService = {
  /**
   * 获取文章评论列表
   */
  async getArticleComments(articleId: number): Promise<GetArticleCommentsResponse> {
    const req: GetArticleCommentsRequest = {
      article_id: articleId,
    }
    return getDiscussionClient().GetArticleComments(req)
  },

  /**
   * 创建评论
   */
  async createComment(
    articleId: number,
    content: string,
    userId: number,
  ): Promise<CreateCommentResponse> {
    const req: CreateCommentRequest = {
      article_id: articleId,
      content,
      user_id: userId,
    }
    return getDiscussionClient().CreateComment(req)
  },

  /**
   * 回复评论
   */
  async replyComment(
    commentId: number,
    content: string,
    userId: number,
  ): Promise<ReplyCommentResponse> {
    const req: ReplyCommentRequest = {
      comment_id: commentId,
      content,
      user_id: userId,
    }
    return getDiscussionClient().ReplyComment(req)
  },

  /**
   * 更新评论
   */
  async updateComment(
    commentId: number,
    content: string,
    userId: number,
  ): Promise<UpdateCommentResponse> {
    const req: UpdateCommentRequest = {
      comment_id: commentId,
      content,
      user_id: userId,
    }
    return getDiscussionClient().UpdateComment(req)
  },

  /**
   * 删除评论
   */
  async deleteComment(
    commentId: number,
    userId: number,
  ): Promise<DeleteCommentResponse> {
    const req: DeleteCommentRequest = {
      comment_id: commentId,
      user_id: userId,
    }
    return getDiscussionClient().DeleteComment(req)
  },
}

export default discussionService
