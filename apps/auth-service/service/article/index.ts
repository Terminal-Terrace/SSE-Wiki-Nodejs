import type {
  AddCollaboratorResponse,
  CreateArticleRequest,
  CreateArticleResponse,
  CreateSubmissionRequest,
  CreateSubmissionResponse,
  GetArticleFavouritesRequest,
  GetArticleFavouritesResponse,
  GetArticleRequest,
  GetArticleResponse,
  GetArticlesByModuleRequest,
  GetArticlesByModuleResponse,
  GetVersionDiffRequest,
  GetVersionDiffResponse,
  GetVersionRequest,
  GetVersionResponse,
  GetVersionsRequest,
  GetVersionsResponse,
  AddCollaboratorRequest as GrpcAddCollaboratorRequest,
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
   */
  async getArticle(
    id: number,
    userId: number = 0,
    userRole: string = '',
  ): Promise<GetArticleResponse> {
    const req: GetArticleRequest = {
      id,
      user_id: userId,
      user_role: userRole,
    }
    return getArticleClient().GetArticle(req)
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
   */
  async createSubmission(
    articleId: number,
    content: string,
    commitMessage: string,
    baseVersionId: number,
    userId: number,
    userRole: string,
  ): Promise<CreateSubmissionResponse> {
    const req: CreateSubmissionRequest = {
      article_id: articleId,
      content,
      commit_message: commitMessage,
      base_version_id: baseVersionId,
      user_id: userId,
      user_role: userRole,
    }
    return getArticleClient().CreateSubmission(req)
  },

  /**
   * 更新文章基础信息
   */
  async updateBasicInfo(
    articleId: number,
    userId: number,
    userRole: string,
    options: {
      title?: string
      tags?: string[]
      isReviewRequired?: boolean
    },
  ): Promise<UpdateBasicInfoResponse> {
    const req: UpdateBasicInfoRequest = {
      article_id: articleId,
      user_id: userId,
      user_role: userRole,
      title: options.title || '',
      tags: options.tags || [],
      is_review_required: options.isReviewRequired || false,
      has_title: options.title !== undefined,
      has_tags: options.tags !== undefined,
      has_is_review_required: options.isReviewRequired !== undefined,
    }
    return getArticleClient().UpdateBasicInfo(req)
  },

  /**
   * 添加协作者
   */
  async addCollaborator(
    articleId: number,
    targetUserId: number,
    role: string,
    userId: number,
    userRole: string,
  ): Promise<AddCollaboratorResponse> {
    const req: GrpcAddCollaboratorRequest = {
      article_id: articleId,
      target_user_id: targetUserId,
      role,
      user_id: userId,
      user_role: userRole,
    }
    return getArticleClient().AddCollaborator(req)
  },
}

export default articleService
