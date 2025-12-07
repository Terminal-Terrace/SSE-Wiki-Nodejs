import type { RpcClientConfig } from '@sse-wiki/rpc-client'
import type * as ArticleServiceTypes from '../protobuf/types/article_service'
import type * as DiscussionServiceTypes from '../protobuf/types/discussion_service'
import type * as ModuleServiceTypes from '../protobuf/types/module_service'
import type * as ReviewServiceTypes from '../protobuf/types/review_service'
import path from 'node:path'
import process from 'node:process'
import { RpcClient } from '@sse-wiki/rpc-client'

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

  async GetModuleTree(req: ModuleServiceTypes.GetModuleTreeRequest): Promise<ModuleServiceTypes.GetModuleTreeResponse> {
    return this.rpcClient.call<ModuleServiceTypes.GetModuleTreeRequest, ModuleServiceTypes.GetModuleTreeResponse>('GetModuleTree', req)
  }

  async GetModule(req: ModuleServiceTypes.GetModuleRequest): Promise<ModuleServiceTypes.GetModuleResponse> {
    return this.rpcClient.call<ModuleServiceTypes.GetModuleRequest, ModuleServiceTypes.GetModuleResponse>('GetModule', req)
  }

  async GetBreadcrumbs(req: ModuleServiceTypes.GetBreadcrumbsRequest): Promise<ModuleServiceTypes.GetBreadcrumbsResponse> {
    return this.rpcClient.call<ModuleServiceTypes.GetBreadcrumbsRequest, ModuleServiceTypes.GetBreadcrumbsResponse>('GetBreadcrumbs', req)
  }

  async CreateModule(req: ModuleServiceTypes.CreateModuleRequest): Promise<ModuleServiceTypes.CreateModuleResponse> {
    return this.rpcClient.call<ModuleServiceTypes.CreateModuleRequest, ModuleServiceTypes.CreateModuleResponse>('CreateModule', req)
  }

  async UpdateModule(req: ModuleServiceTypes.UpdateModuleRequest): Promise<ModuleServiceTypes.UpdateModuleResponse> {
    return this.rpcClient.call<ModuleServiceTypes.UpdateModuleRequest, ModuleServiceTypes.UpdateModuleResponse>('UpdateModule', req)
  }

  async DeleteModule(req: ModuleServiceTypes.DeleteModuleRequest): Promise<ModuleServiceTypes.DeleteModuleResponse> {
    return this.rpcClient.call<ModuleServiceTypes.DeleteModuleRequest, ModuleServiceTypes.DeleteModuleResponse>('DeleteModule', req)
  }

  async GetModerators(req: ModuleServiceTypes.GetModeratorsRequest): Promise<ModuleServiceTypes.GetModeratorsResponse> {
    return this.rpcClient.call<ModuleServiceTypes.GetModeratorsRequest, ModuleServiceTypes.GetModeratorsResponse>('GetModerators', req)
  }

  async AddModerator(req: ModuleServiceTypes.AddModeratorRequest): Promise<ModuleServiceTypes.AddModeratorResponse> {
    return this.rpcClient.call<ModuleServiceTypes.AddModeratorRequest, ModuleServiceTypes.AddModeratorResponse>('AddModerator', req)
  }

  async RemoveModerator(req: ModuleServiceTypes.RemoveModeratorRequest): Promise<ModuleServiceTypes.RemoveModeratorResponse> {
    return this.rpcClient.call<ModuleServiceTypes.RemoveModeratorRequest, ModuleServiceTypes.RemoveModeratorResponse>('RemoveModerator', req)
  }

  async HandleLock(req: ModuleServiceTypes.HandleLockRequest): Promise<ModuleServiceTypes.HandleLockResponse> {
    return this.rpcClient.call<ModuleServiceTypes.HandleLockRequest, ModuleServiceTypes.HandleLockResponse>('HandleLock', req)
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

  async GetArticlesByModule(req: ArticleServiceTypes.GetArticlesByModuleRequest): Promise<ArticleServiceTypes.GetArticlesByModuleResponse> {
    return this.rpcClient.call<ArticleServiceTypes.GetArticlesByModuleRequest, ArticleServiceTypes.GetArticlesByModuleResponse>('GetArticlesByModule', req)
  }

  async GetArticle(req: ArticleServiceTypes.GetArticleRequest): Promise<ArticleServiceTypes.GetArticleResponse> {
    return this.rpcClient.call<ArticleServiceTypes.GetArticleRequest, ArticleServiceTypes.GetArticleResponse>('GetArticle', req)
  }

  async GetVersions(req: ArticleServiceTypes.GetVersionsRequest): Promise<ArticleServiceTypes.GetVersionsResponse> {
    return this.rpcClient.call<ArticleServiceTypes.GetVersionsRequest, ArticleServiceTypes.GetVersionsResponse>('GetVersions', req)
  }

  async GetVersion(req: ArticleServiceTypes.GetVersionRequest): Promise<ArticleServiceTypes.GetVersionResponse> {
    return this.rpcClient.call<ArticleServiceTypes.GetVersionRequest, ArticleServiceTypes.GetVersionResponse>('GetVersion', req)
  }

  async GetVersionDiff(req: ArticleServiceTypes.GetVersionDiffRequest): Promise<ArticleServiceTypes.GetVersionDiffResponse> {
    return this.rpcClient.call<ArticleServiceTypes.GetVersionDiffRequest, ArticleServiceTypes.GetVersionDiffResponse>('GetVersionDiff', req)
  }

  async GetUserArticleFavourites(req: ArticleServiceTypes.GetArticleFavouritesRequest): Promise<ArticleServiceTypes.GetArticleFavouritesResponse> {
    return this.rpcClient.call<ArticleServiceTypes.GetArticleFavouritesRequest, ArticleServiceTypes.GetArticleFavouritesResponse>('GetUserArticleFavourites', req)
  }

  async CreateArticle(req: ArticleServiceTypes.CreateArticleRequest): Promise<ArticleServiceTypes.CreateArticleResponse> {
    return this.rpcClient.call<ArticleServiceTypes.CreateArticleRequest, ArticleServiceTypes.CreateArticleResponse>('CreateArticle', req)
  }

  async CreateSubmission(req: ArticleServiceTypes.CreateSubmissionRequest): Promise<ArticleServiceTypes.CreateSubmissionResponse> {
    return this.rpcClient.call<ArticleServiceTypes.CreateSubmissionRequest, ArticleServiceTypes.CreateSubmissionResponse>('CreateSubmission', req)
  }

  async UpdateBasicInfo(req: ArticleServiceTypes.UpdateBasicInfoRequest): Promise<ArticleServiceTypes.UpdateBasicInfoResponse> {
    return this.rpcClient.call<ArticleServiceTypes.UpdateBasicInfoRequest, ArticleServiceTypes.UpdateBasicInfoResponse>('UpdateBasicInfo', req)
  }

  async AddCollaborator(req: ArticleServiceTypes.AddCollaboratorRequest): Promise<ArticleServiceTypes.AddCollaboratorResponse> {
    return this.rpcClient.call<ArticleServiceTypes.AddCollaboratorRequest, ArticleServiceTypes.AddCollaboratorResponse>('AddCollaborator', req)
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

  async GetReviews(req: ReviewServiceTypes.GetReviewsRequest): Promise<ReviewServiceTypes.GetReviewsResponse> {
    return this.rpcClient.call<ReviewServiceTypes.GetReviewsRequest, ReviewServiceTypes.GetReviewsResponse>('GetReviews', req)
  }

  async GetReviewDetail(req: ReviewServiceTypes.GetReviewDetailRequest): Promise<ReviewServiceTypes.GetReviewDetailResponse> {
    return this.rpcClient.call<ReviewServiceTypes.GetReviewDetailRequest, ReviewServiceTypes.GetReviewDetailResponse>('GetReviewDetail', req)
  }

  async ReviewAction(req: ReviewServiceTypes.ReviewActionRequest): Promise<ReviewServiceTypes.ReviewActionResponse> {
    return this.rpcClient.call<ReviewServiceTypes.ReviewActionRequest, ReviewServiceTypes.ReviewActionResponse>('ReviewAction', req)
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

  async GetArticleComments(req: DiscussionServiceTypes.GetArticleCommentsRequest): Promise<DiscussionServiceTypes.GetArticleCommentsResponse> {
    return this.rpcClient.call<DiscussionServiceTypes.GetArticleCommentsRequest, DiscussionServiceTypes.GetArticleCommentsResponse>('GetArticleComments', req)
  }

  async CreateComment(req: DiscussionServiceTypes.CreateCommentRequest): Promise<DiscussionServiceTypes.CreateCommentResponse> {
    return this.rpcClient.call<DiscussionServiceTypes.CreateCommentRequest, DiscussionServiceTypes.CreateCommentResponse>('CreateComment', req)
  }

  async ReplyComment(req: DiscussionServiceTypes.ReplyCommentRequest): Promise<DiscussionServiceTypes.ReplyCommentResponse> {
    return this.rpcClient.call<DiscussionServiceTypes.ReplyCommentRequest, DiscussionServiceTypes.ReplyCommentResponse>('ReplyComment', req)
  }

  async UpdateComment(req: DiscussionServiceTypes.UpdateCommentRequest): Promise<DiscussionServiceTypes.UpdateCommentResponse> {
    return this.rpcClient.call<DiscussionServiceTypes.UpdateCommentRequest, DiscussionServiceTypes.UpdateCommentResponse>('UpdateComment', req)
  }

  async DeleteComment(req: DiscussionServiceTypes.DeleteCommentRequest): Promise<DiscussionServiceTypes.DeleteCommentResponse> {
    return this.rpcClient.call<DiscussionServiceTypes.DeleteCommentRequest, DiscussionServiceTypes.DeleteCommentResponse>('DeleteComment', req)
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
