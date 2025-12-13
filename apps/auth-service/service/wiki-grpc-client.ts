import type { Metadata } from '@grpc/grpc-js'
import type { RpcClientConfig } from '@sse-wiki/rpc-client'
import type * as ArticleServiceTypes from '../protobuf/types/article_service'
import type * as DiscussionServiceTypes from '../protobuf/types/discussion_service'
import type * as ModuleServiceTypes from '../protobuf/types/module_service'
import type * as ReviewServiceTypes from '../protobuf/types/review_service'
import path from 'node:path'
import process from 'node:process'
import { RpcClient } from '@sse-wiki/rpc-client'

// Re-export Metadata for convenience
export { Metadata } from '@sse-wiki/rpc-client'

/**
 * 服务客户端配置
 */
export interface ServiceConfig {
  serverAddress?: string
  /** 其他 RpcClient 配置 */
  rpcConfig?: Partial<Omit<RpcClientConfig, 'protoPath' | 'packageName' | 'serviceClassName' | 'serverAddress'>>
}

// 默认 gRPC 地址 (sse-wiki 服务)
const DEFAULT_WIKI_GRPC_ADDRESS = process.env.WIKI_GRPC_ADDRESS || 'localhost:50052'

/**
 * ModuleService gRPC 客户端
 */
export class ModuleServiceClient {
  private rpcClient: RpcClient

  constructor(config?: ServiceConfig) {
    const protoPath = path.join(import.meta.dirname, '..', 'protobuf', 'proto', 'module_service', 'module_service.proto')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: 'module_service',
      serviceClassName: 'ModuleService',
      serverAddress: config?.serverAddress || DEFAULT_WIKI_GRPC_ADDRESS,
      ...config?.rpcConfig,
    })
  }

  async GetModuleTree(req: ModuleServiceTypes.GetModuleTreeRequest, metadata?: Metadata): Promise<ModuleServiceTypes.GetModuleTreeResponse> {
    return this.rpcClient.call<ModuleServiceTypes.GetModuleTreeRequest, ModuleServiceTypes.GetModuleTreeResponse>('GetModuleTree', req, metadata)
  }

  async GetModule(req: ModuleServiceTypes.GetModuleRequest, metadata?: Metadata): Promise<ModuleServiceTypes.GetModuleResponse> {
    return this.rpcClient.call<ModuleServiceTypes.GetModuleRequest, ModuleServiceTypes.GetModuleResponse>('GetModule', req, metadata)
  }

  async GetBreadcrumbs(req: ModuleServiceTypes.GetBreadcrumbsRequest, metadata?: Metadata): Promise<ModuleServiceTypes.GetBreadcrumbsResponse> {
    return this.rpcClient.call<ModuleServiceTypes.GetBreadcrumbsRequest, ModuleServiceTypes.GetBreadcrumbsResponse>('GetBreadcrumbs', req, metadata)
  }

  async CreateModule(req: ModuleServiceTypes.CreateModuleRequest, metadata?: Metadata): Promise<ModuleServiceTypes.CreateModuleResponse> {
    return this.rpcClient.call<ModuleServiceTypes.CreateModuleRequest, ModuleServiceTypes.CreateModuleResponse>('CreateModule', req, metadata)
  }

  async UpdateModule(req: ModuleServiceTypes.UpdateModuleRequest, metadata?: Metadata): Promise<ModuleServiceTypes.UpdateModuleResponse> {
    return this.rpcClient.call<ModuleServiceTypes.UpdateModuleRequest, ModuleServiceTypes.UpdateModuleResponse>('UpdateModule', req, metadata)
  }

  async DeleteModule(req: ModuleServiceTypes.DeleteModuleRequest, metadata?: Metadata): Promise<ModuleServiceTypes.DeleteModuleResponse> {
    return this.rpcClient.call<ModuleServiceTypes.DeleteModuleRequest, ModuleServiceTypes.DeleteModuleResponse>('DeleteModule', req, metadata)
  }

  async GetModerators(req: ModuleServiceTypes.GetModeratorsRequest, metadata?: Metadata): Promise<ModuleServiceTypes.GetModeratorsResponse> {
    return this.rpcClient.call<ModuleServiceTypes.GetModeratorsRequest, ModuleServiceTypes.GetModeratorsResponse>('GetModerators', req, metadata)
  }

  async AddModerator(req: ModuleServiceTypes.AddModeratorRequest, metadata?: Metadata): Promise<ModuleServiceTypes.AddModeratorResponse> {
    return this.rpcClient.call<ModuleServiceTypes.AddModeratorRequest, ModuleServiceTypes.AddModeratorResponse>('AddModerator', req, metadata)
  }

  async RemoveModerator(req: ModuleServiceTypes.RemoveModeratorRequest, metadata?: Metadata): Promise<ModuleServiceTypes.RemoveModeratorResponse> {
    return this.rpcClient.call<ModuleServiceTypes.RemoveModeratorRequest, ModuleServiceTypes.RemoveModeratorResponse>('RemoveModerator', req, metadata)
  }

  async HandleLock(req: ModuleServiceTypes.HandleLockRequest, metadata?: Metadata): Promise<ModuleServiceTypes.HandleLockResponse> {
    return this.rpcClient.call<ModuleServiceTypes.HandleLockRequest, ModuleServiceTypes.HandleLockResponse>('HandleLock', req, metadata)
  }

  close(): void {
    this.rpcClient.close()
  }

  async waitForReady(deadline?: number): Promise<void> {
    return this.rpcClient.waitForReady(deadline)
  }
}

/**
 * ArticleService gRPC 客户端
 */
export class ArticleServiceClient {
  private rpcClient: RpcClient

  constructor(config?: ServiceConfig) {
    const protoPath = path.join(import.meta.dirname, '..', 'protobuf', 'proto', 'article_service', 'article_service.proto')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: 'article_service',
      serviceClassName: 'ArticleService',
      serverAddress: config?.serverAddress || DEFAULT_WIKI_GRPC_ADDRESS,
      ...config?.rpcConfig,
    })
  }

  async GetArticlesByModule(req: ArticleServiceTypes.GetArticlesByModuleRequest, metadata?: Metadata): Promise<ArticleServiceTypes.GetArticlesByModuleResponse> {
    return this.rpcClient.call<ArticleServiceTypes.GetArticlesByModuleRequest, ArticleServiceTypes.GetArticlesByModuleResponse>('GetArticlesByModule', req, metadata)
  }

  async GetArticle(req: ArticleServiceTypes.GetArticleRequest, metadata?: Metadata): Promise<ArticleServiceTypes.GetArticleResponse> {
    return this.rpcClient.call<ArticleServiceTypes.GetArticleRequest, ArticleServiceTypes.GetArticleResponse>('GetArticle', req, metadata)
  }

  async GetVersions(req: ArticleServiceTypes.GetVersionsRequest, metadata?: Metadata): Promise<ArticleServiceTypes.GetVersionsResponse> {
    return this.rpcClient.call<ArticleServiceTypes.GetVersionsRequest, ArticleServiceTypes.GetVersionsResponse>('GetVersions', req, metadata)
  }

  async GetVersion(req: ArticleServiceTypes.GetVersionRequest, metadata?: Metadata): Promise<ArticleServiceTypes.GetVersionResponse> {
    return this.rpcClient.call<ArticleServiceTypes.GetVersionRequest, ArticleServiceTypes.GetVersionResponse>('GetVersion', req, metadata)
  }

  async GetVersionDiff(req: ArticleServiceTypes.GetVersionDiffRequest, metadata?: Metadata): Promise<ArticleServiceTypes.GetVersionDiffResponse> {
    return this.rpcClient.call<ArticleServiceTypes.GetVersionDiffRequest, ArticleServiceTypes.GetVersionDiffResponse>('GetVersionDiff', req, metadata)
  }

  async GetUserArticleFavourites(req: ArticleServiceTypes.GetArticleFavouritesRequest, metadata?: Metadata): Promise<ArticleServiceTypes.GetArticleFavouritesResponse> {
    return this.rpcClient.call<ArticleServiceTypes.GetArticleFavouritesRequest, ArticleServiceTypes.GetArticleFavouritesResponse>('GetUserArticleFavourites', req, metadata)
  }

  async UpdateUserFavourites(req: ArticleServiceTypes.UpdateUserFavouritesRequest, metadata?: Metadata): Promise<ArticleServiceTypes.UpdateUserFavouritesResponse> {
    return this.rpcClient.call<ArticleServiceTypes.UpdateUserFavouritesRequest, ArticleServiceTypes.UpdateUserFavouritesResponse>('UpdateUserFavourites', req, metadata)
  }

  async CreateArticle(req: ArticleServiceTypes.CreateArticleRequest, metadata?: Metadata): Promise<ArticleServiceTypes.CreateArticleResponse> {
    return this.rpcClient.call<ArticleServiceTypes.CreateArticleRequest, ArticleServiceTypes.CreateArticleResponse>('CreateArticle', req, metadata)
  }

  async CreateSubmission(req: ArticleServiceTypes.CreateSubmissionRequest, metadata?: Metadata): Promise<ArticleServiceTypes.CreateSubmissionResponse> {
    return this.rpcClient.call<ArticleServiceTypes.CreateSubmissionRequest, ArticleServiceTypes.CreateSubmissionResponse>('CreateSubmission', req, metadata)
  }

  async UpdateBasicInfo(req: ArticleServiceTypes.UpdateBasicInfoRequest, metadata?: Metadata): Promise<ArticleServiceTypes.UpdateBasicInfoResponse> {
    return this.rpcClient.call<ArticleServiceTypes.UpdateBasicInfoRequest, ArticleServiceTypes.UpdateBasicInfoResponse>('UpdateBasicInfo', req, metadata)
  }

  async GetCollaborators(req: ArticleServiceTypes.GetCollaboratorsRequest, metadata?: Metadata): Promise<ArticleServiceTypes.GetCollaboratorsResponse> {
    return this.rpcClient.call<ArticleServiceTypes.GetCollaboratorsRequest, ArticleServiceTypes.GetCollaboratorsResponse>('GetCollaborators', req, metadata)
  }

  async AddCollaborator(req: ArticleServiceTypes.AddCollaboratorRequest, metadata?: Metadata): Promise<ArticleServiceTypes.AddCollaboratorResponse> {
    return this.rpcClient.call<ArticleServiceTypes.AddCollaboratorRequest, ArticleServiceTypes.AddCollaboratorResponse>('AddCollaborator', req, metadata)
  }

  async RemoveCollaborator(req: ArticleServiceTypes.RemoveCollaboratorRequest, metadata?: Metadata): Promise<ArticleServiceTypes.RemoveCollaboratorResponse> {
    return this.rpcClient.call<ArticleServiceTypes.RemoveCollaboratorRequest, ArticleServiceTypes.RemoveCollaboratorResponse>('RemoveCollaborator', req, metadata)
  }

  async DeleteArticle(req: ArticleServiceTypes.DeleteArticleRequest, metadata?: Metadata): Promise<ArticleServiceTypes.DeleteArticleResponse> {
    return this.rpcClient.call<ArticleServiceTypes.DeleteArticleRequest, ArticleServiceTypes.DeleteArticleResponse>('DeleteArticle', req, metadata)
  }

  close(): void {
    this.rpcClient.close()
  }

  async waitForReady(deadline?: number): Promise<void> {
    return this.rpcClient.waitForReady(deadline)
  }
}

/**
 * ReviewService gRPC 客户端
 */
export class ReviewServiceClient {
  private rpcClient: RpcClient

  constructor(config?: ServiceConfig) {
    const protoPath = path.join(import.meta.dirname, '..', 'protobuf', 'proto', 'review_service', 'review_service.proto')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: 'review_service',
      serviceClassName: 'ReviewService',
      serverAddress: config?.serverAddress || DEFAULT_WIKI_GRPC_ADDRESS,
      ...config?.rpcConfig,
    })
  }

  async GetReviews(req: ReviewServiceTypes.GetReviewsRequest, metadata?: Metadata): Promise<ReviewServiceTypes.GetReviewsResponse> {
    return this.rpcClient.call<ReviewServiceTypes.GetReviewsRequest, ReviewServiceTypes.GetReviewsResponse>('GetReviews', req, metadata)
  }

  async GetReviewDetail(req: ReviewServiceTypes.GetReviewDetailRequest, metadata?: Metadata): Promise<ReviewServiceTypes.GetReviewDetailResponse> {
    return this.rpcClient.call<ReviewServiceTypes.GetReviewDetailRequest, ReviewServiceTypes.GetReviewDetailResponse>('GetReviewDetail', req, metadata)
  }

  async ReviewAction(req: ReviewServiceTypes.ReviewActionRequest, metadata?: Metadata): Promise<ReviewServiceTypes.ReviewActionResponse> {
    return this.rpcClient.call<ReviewServiceTypes.ReviewActionRequest, ReviewServiceTypes.ReviewActionResponse>('ReviewAction', req, metadata)
  }

  close(): void {
    this.rpcClient.close()
  }

  async waitForReady(deadline?: number): Promise<void> {
    return this.rpcClient.waitForReady(deadline)
  }
}

/**
 * DiscussionService gRPC 客户端
 */
export class DiscussionServiceClient {
  private rpcClient: RpcClient

  constructor(config?: ServiceConfig) {
    const protoPath = path.join(import.meta.dirname, '..', 'protobuf', 'proto', 'discussion_service', 'discussion_service.proto')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: 'discussion_service',
      serviceClassName: 'DiscussionService',
      serverAddress: config?.serverAddress || DEFAULT_WIKI_GRPC_ADDRESS,
      ...config?.rpcConfig,
    })
  }

  async GetArticleComments(req: DiscussionServiceTypes.GetArticleCommentsRequest, metadata?: Metadata): Promise<DiscussionServiceTypes.GetArticleCommentsResponse> {
    return this.rpcClient.call<DiscussionServiceTypes.GetArticleCommentsRequest, DiscussionServiceTypes.GetArticleCommentsResponse>('GetArticleComments', req, metadata)
  }

  async CreateComment(req: DiscussionServiceTypes.CreateCommentRequest, metadata?: Metadata): Promise<DiscussionServiceTypes.CreateCommentResponse> {
    return this.rpcClient.call<DiscussionServiceTypes.CreateCommentRequest, DiscussionServiceTypes.CreateCommentResponse>('CreateComment', req, metadata)
  }

  async ReplyComment(req: DiscussionServiceTypes.ReplyCommentRequest, metadata?: Metadata): Promise<DiscussionServiceTypes.ReplyCommentResponse> {
    return this.rpcClient.call<DiscussionServiceTypes.ReplyCommentRequest, DiscussionServiceTypes.ReplyCommentResponse>('ReplyComment', req, metadata)
  }

  async UpdateComment(req: DiscussionServiceTypes.UpdateCommentRequest, metadata?: Metadata): Promise<DiscussionServiceTypes.UpdateCommentResponse> {
    return this.rpcClient.call<DiscussionServiceTypes.UpdateCommentRequest, DiscussionServiceTypes.UpdateCommentResponse>('UpdateComment', req, metadata)
  }

  async DeleteComment(req: DiscussionServiceTypes.DeleteCommentRequest, metadata?: Metadata): Promise<DiscussionServiceTypes.DeleteCommentResponse> {
    return this.rpcClient.call<DiscussionServiceTypes.DeleteCommentRequest, DiscussionServiceTypes.DeleteCommentResponse>('DeleteComment', req, metadata)
  }

  close(): void {
    this.rpcClient.close()
  }

  async waitForReady(deadline?: number): Promise<void> {
    return this.rpcClient.waitForReady(deadline)
  }
}

// 单例客户端实例
let moduleClient: ModuleServiceClient | null = null
let articleClient: ArticleServiceClient | null = null
let reviewClient: ReviewServiceClient | null = null
let discussionClient: DiscussionServiceClient | null = null

/**
 * 获取 ModuleService 单例客户端
 */
export function getModuleClient(): ModuleServiceClient {
  if (!moduleClient) {
    moduleClient = new ModuleServiceClient()
    // eslint-disable-next-line no-console
    console.log('[wiki-grpc] ModuleService client connecting to:', DEFAULT_WIKI_GRPC_ADDRESS)
  }
  return moduleClient
}

/**
 * 获取 ArticleService 单例客户端
 */
export function getArticleClient(): ArticleServiceClient {
  if (!articleClient) {
    articleClient = new ArticleServiceClient()
    // eslint-disable-next-line no-console
    console.log('[wiki-grpc] ArticleService client connecting to:', DEFAULT_WIKI_GRPC_ADDRESS)
  }
  return articleClient
}

/**
 * 获取 ReviewService 单例客户端
 */
export function getReviewClient(): ReviewServiceClient {
  if (!reviewClient) {
    reviewClient = new ReviewServiceClient()
    // eslint-disable-next-line no-console
    console.log('[wiki-grpc] ReviewService client connecting to:', DEFAULT_WIKI_GRPC_ADDRESS)
  }
  return reviewClient
}

/**
 * 获取 DiscussionService 单例客户端
 */
export function getDiscussionClient(): DiscussionServiceClient {
  if (!discussionClient) {
    discussionClient = new DiscussionServiceClient()
    // eslint-disable-next-line no-console
    console.log('[wiki-grpc] DiscussionService client connecting to:', DEFAULT_WIKI_GRPC_ADDRESS)
  }
  return discussionClient
}
