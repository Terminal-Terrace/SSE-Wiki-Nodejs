import type { Metadata } from '@sse-wiki/rpc-client'
import type {
  AddCollaboratorResponse,
  CreateArticleRequest,
  CreateArticleResponse,
  CreateSubmissionRequest,
  CreateSubmissionResponse,
  DeleteArticleRequest,
  DeleteArticleResponse,
  GetArticleFavouritesRequest,
  GetArticleFavouritesResponse,
  GetArticleRequest,
  GetArticleResponse,
  GetArticlesByModuleRequest,
  GetArticlesByModuleResponse,
  GetCollaboratorsRequest,
  GetCollaboratorsResponse,
  GetVersionDiffRequest,
  GetVersionDiffResponse,
  GetVersionRequest,
  GetVersionResponse,
  GetVersionsRequest,
  GetVersionsResponse,
  AddCollaboratorRequest as GrpcAddCollaboratorRequest,
  RemoveCollaboratorRequest,
  RemoveCollaboratorResponse,
  UpdateBasicInfoRequest,
  UpdateBasicInfoResponse,
  UpdateUserFavouritesRequest,
  UpdateUserFavouritesResponse,
} from '../../protobuf/types/article_service'
import { getArticleClient } from '../wiki-grpc-client'

/**
 * Article Service - 封装 gRPC 调用
 */
export const articleService = {
  /**
   * 获取模块下的文章列表
   */
  async getArticlesByModule(
    moduleId: number,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<GetArticlesByModuleResponse> {
    const req: GetArticlesByModuleRequest = {
      module_id: moduleId,
      page,
      page_size: pageSize,
    }
    return getArticleClient().GetArticlesByModule(req)
  },

  /**
   * 获取文章详情
   * 用户信息通过 JWT metadata 传递
   */
  async getArticle(
    id: number,
    metadata?: Metadata,
  ): Promise<GetArticleResponse> {
    const req: GetArticleRequest = { id }
    return getArticleClient().GetArticle(req, metadata)
  },

  /**
   * 获取用户的收藏文章
   */
  async getUserFavourArticles(userId: string): Promise<GetArticleFavouritesResponse> {
    const req: GetArticleFavouritesRequest = { user_id: userId }
    return getArticleClient().GetUserArticleFavourites(req)
  },

  /**
   * 更新用户的收藏文章
   */
  async updateUserFavouriteArticles(userId: number, articleId: number, is_added: boolean): Promise<UpdateUserFavouritesResponse> {
    const req: UpdateUserFavouritesRequest = { user_id: userId, article_id: articleId, is_add: is_added }
    return getArticleClient().UpdateUserFavourites(req)
  },

  /**
   * 获取文章版本列表
   */
  async getVersions(articleId: number): Promise<GetVersionsResponse> {
    const req: GetVersionsRequest = { article_id: articleId }
    return getArticleClient().GetVersions(req)
  },

  /**
   * 获取特定版本
   */
  async getVersion(id: number): Promise<GetVersionResponse> {
    const req: GetVersionRequest = { id }
    return getArticleClient().GetVersion(req)
  },

  /**
   * 获取版本diff
   */
  async getVersionDiff(versionId: number): Promise<GetVersionDiffResponse> {
    const req: GetVersionDiffRequest = { version_id: versionId }
    return getArticleClient().GetVersionDiff(req)
  },

  /**
   * 创建文章
   */
  async createArticle(
    title: string,
    moduleId: number,
    content: string,
    commitMessage: string,
    isReviewRequired: boolean,
    tags: string[],
    userId: number,
  ): Promise<CreateArticleResponse> {
    const req: CreateArticleRequest = {
      title,
      module_id: moduleId,
      content,
      commit_message: commitMessage,
      is_review_required: isReviewRequired,
      tags,
      user_id: userId,
    }
    return getArticleClient().CreateArticle(req)
  },

  /**
   * 创建提交
   * 用户信息通过 JWT metadata 传递
   */
  async createSubmission(
    articleId: number,
    content: string,
    commitMessage: string,
    baseVersionId: number,
    metadata?: Metadata,
  ): Promise<CreateSubmissionResponse> {
    const req: CreateSubmissionRequest = {
      article_id: articleId,
      content,
      commit_message: commitMessage,
      base_version_id: baseVersionId,
    }
    return getArticleClient().CreateSubmission(req, metadata)
  },

  /**
   * 更新文章基础信息
   * 用户信息通过 JWT metadata 传递
   */
  async updateBasicInfo(
    articleId: number,
    options: {
      title?: string
      tags?: string[]
      isReviewRequired?: boolean
    },
    metadata?: Metadata,
  ): Promise<UpdateBasicInfoResponse> {
    const req: UpdateBasicInfoRequest = {
      article_id: articleId,
      title: options.title || '',
      tags: options.tags || [],
      is_review_required: options.isReviewRequired || false,
      has_title: options.title !== undefined,
      has_tags: options.tags !== undefined,
      has_is_review_required: options.isReviewRequired !== undefined,
    }
    return getArticleClient().UpdateBasicInfo(req, metadata)
  },

  /**
   * 获取文章协作者列表
   * 用户信息通过 JWT metadata 传递
   */
  async getCollaborators(
    articleId: number,
    metadata?: Metadata,
  ): Promise<GetCollaboratorsResponse> {
    const req: GetCollaboratorsRequest = { article_id: articleId }
    return getArticleClient().GetCollaborators(req, metadata)
  },

  /**
   * 添加协作者
   * 用户信息通过 JWT metadata 传递
   */
  async addCollaborator(
    articleId: number,
    targetUserId: number,
    role: string,
    metadata?: Metadata,
  ): Promise<AddCollaboratorResponse> {
    const req: GrpcAddCollaboratorRequest = {
      article_id: articleId,
      target_user_id: targetUserId,
      role,
    }
    return getArticleClient().AddCollaborator(req, metadata)
  },

  /**
   * 移除协作者
   * 用户信息通过 JWT metadata 传递
   */
  async removeCollaborator(
    articleId: number,
    targetUserId: number,
    metadata?: Metadata,
  ): Promise<RemoveCollaboratorResponse> {
    const req: RemoveCollaboratorRequest = {
      article_id: articleId,
      target_user_id: targetUserId,
    }
    return getArticleClient().RemoveCollaborator(req, metadata)
  },

  /**
   * 删除文章
   * 权限要求：Global_Admin 或 Author/Admin 可删除
   * 用户信息通过 JWT metadata 传递
   */
  async deleteArticle(
    articleId: number,
    metadata?: Metadata,
  ): Promise<DeleteArticleResponse> {
    const req: DeleteArticleRequest = { article_id: articleId }
    return getArticleClient().DeleteArticle(req, metadata)
  },
}

export default articleService
