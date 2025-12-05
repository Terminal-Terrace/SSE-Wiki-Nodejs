import type { RpcClientConfig } from '@sse-wiki/rpc-client'
import type * as SSEWikiTypes from '../protobuf/types/ssewiki'
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
    const protoPath = path.join(import.meta.dirname, '..', 'protobuf', 'proto', 'ssewiki', 'ssewiki.proto')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: 'ssewiki',
      serviceClassName: 'ModuleService',
      serverAddress: config?.serverAddress || DEFAULT_WIKI_GRPC_ADDRESS,
      ...config?.rpcConfig,
    })
  }

  async GetModuleTree(req: SSEWikiTypes.GetModuleTreeRequest): Promise<SSEWikiTypes.GetModuleTreeResponse> {
    return this.rpcClient.call<SSEWikiTypes.GetModuleTreeRequest, SSEWikiTypes.GetModuleTreeResponse>('GetModuleTree', req)
  }

  async GetModule(req: SSEWikiTypes.GetModuleRequest): Promise<SSEWikiTypes.GetModuleResponse> {
    return this.rpcClient.call<SSEWikiTypes.GetModuleRequest, SSEWikiTypes.GetModuleResponse>('GetModule', req)
  }

  async GetBreadcrumbs(req: SSEWikiTypes.GetBreadcrumbsRequest): Promise<SSEWikiTypes.GetBreadcrumbsResponse> {
    return this.rpcClient.call<SSEWikiTypes.GetBreadcrumbsRequest, SSEWikiTypes.GetBreadcrumbsResponse>('GetBreadcrumbs', req)
  }

  async CreateModule(req: SSEWikiTypes.CreateModuleRequest): Promise<SSEWikiTypes.CreateModuleResponse> {
    return this.rpcClient.call<SSEWikiTypes.CreateModuleRequest, SSEWikiTypes.CreateModuleResponse>('CreateModule', req)
  }

  async UpdateModule(req: SSEWikiTypes.UpdateModuleRequest): Promise<SSEWikiTypes.UpdateModuleResponse> {
    return this.rpcClient.call<SSEWikiTypes.UpdateModuleRequest, SSEWikiTypes.UpdateModuleResponse>('UpdateModule', req)
  }

  async DeleteModule(req: SSEWikiTypes.DeleteModuleRequest): Promise<SSEWikiTypes.DeleteModuleResponse> {
    return this.rpcClient.call<SSEWikiTypes.DeleteModuleRequest, SSEWikiTypes.DeleteModuleResponse>('DeleteModule', req)
  }

  async GetModerators(req: SSEWikiTypes.GetModeratorsRequest): Promise<SSEWikiTypes.GetModeratorsResponse> {
    return this.rpcClient.call<SSEWikiTypes.GetModeratorsRequest, SSEWikiTypes.GetModeratorsResponse>('GetModerators', req)
  }

  async AddModerator(req: SSEWikiTypes.AddModeratorRequest): Promise<SSEWikiTypes.AddModeratorResponse> {
    return this.rpcClient.call<SSEWikiTypes.AddModeratorRequest, SSEWikiTypes.AddModeratorResponse>('AddModerator', req)
  }

  async RemoveModerator(req: SSEWikiTypes.RemoveModeratorRequest): Promise<SSEWikiTypes.RemoveModeratorResponse> {
    return this.rpcClient.call<SSEWikiTypes.RemoveModeratorRequest, SSEWikiTypes.RemoveModeratorResponse>('RemoveModerator', req)
  }

  async HandleLock(req: SSEWikiTypes.HandleLockRequest): Promise<SSEWikiTypes.HandleLockResponse> {
    return this.rpcClient.call<SSEWikiTypes.HandleLockRequest, SSEWikiTypes.HandleLockResponse>('HandleLock', req)
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
    const protoPath = path.join(import.meta.dirname, '..', 'protobuf', 'proto', 'ssewiki', 'ssewiki.proto')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: 'ssewiki',
      serviceClassName: 'ArticleService',
      serverAddress: config?.serverAddress || DEFAULT_WIKI_GRPC_ADDRESS,
      ...config?.rpcConfig,
    })
  }

  async GetArticlesByModule(req: SSEWikiTypes.GetArticlesByModuleRequest): Promise<SSEWikiTypes.GetArticlesByModuleResponse> {
    return this.rpcClient.call<SSEWikiTypes.GetArticlesByModuleRequest, SSEWikiTypes.GetArticlesByModuleResponse>('GetArticlesByModule', req)
  }

  async GetArticle(req: SSEWikiTypes.GetArticleRequest): Promise<SSEWikiTypes.GetArticleResponse> {
    return this.rpcClient.call<SSEWikiTypes.GetArticleRequest, SSEWikiTypes.GetArticleResponse>('GetArticle', req)
  }

  async GetVersions(req: SSEWikiTypes.GetVersionsRequest): Promise<SSEWikiTypes.GetVersionsResponse> {
    return this.rpcClient.call<SSEWikiTypes.GetVersionsRequest, SSEWikiTypes.GetVersionsResponse>('GetVersions', req)
  }

  async GetVersion(req: SSEWikiTypes.GetVersionRequest): Promise<SSEWikiTypes.GetVersionResponse> {
    return this.rpcClient.call<SSEWikiTypes.GetVersionRequest, SSEWikiTypes.GetVersionResponse>('GetVersion', req)
  }

  async GetVersionDiff(req: SSEWikiTypes.GetVersionDiffRequest): Promise<SSEWikiTypes.GetVersionDiffResponse> {
    return this.rpcClient.call<SSEWikiTypes.GetVersionDiffRequest, SSEWikiTypes.GetVersionDiffResponse>('GetVersionDiff', req)
  }

  async CreateArticle(req: SSEWikiTypes.CreateArticleRequest): Promise<SSEWikiTypes.CreateArticleResponse> {
    return this.rpcClient.call<SSEWikiTypes.CreateArticleRequest, SSEWikiTypes.CreateArticleResponse>('CreateArticle', req)
  }

  async CreateSubmission(req: SSEWikiTypes.CreateSubmissionRequest): Promise<SSEWikiTypes.CreateSubmissionResponse> {
    return this.rpcClient.call<SSEWikiTypes.CreateSubmissionRequest, SSEWikiTypes.CreateSubmissionResponse>('CreateSubmission', req)
  }

  async UpdateBasicInfo(req: SSEWikiTypes.UpdateBasicInfoRequest): Promise<SSEWikiTypes.UpdateBasicInfoResponse> {
    return this.rpcClient.call<SSEWikiTypes.UpdateBasicInfoRequest, SSEWikiTypes.UpdateBasicInfoResponse>('UpdateBasicInfo', req)
  }

  async AddCollaborator(req: SSEWikiTypes.AddCollaboratorRequest): Promise<SSEWikiTypes.AddCollaboratorResponse> {
    return this.rpcClient.call<SSEWikiTypes.AddCollaboratorRequest, SSEWikiTypes.AddCollaboratorResponse>('AddCollaborator', req)
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
    const protoPath = path.join(import.meta.dirname, '..', 'protobuf', 'proto', 'ssewiki', 'ssewiki.proto')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: 'ssewiki',
      serviceClassName: 'ReviewService',
      serverAddress: config?.serverAddress || DEFAULT_WIKI_GRPC_ADDRESS,
      ...config?.rpcConfig,
    })
  }

  async GetReviews(req: SSEWikiTypes.GetReviewsRequest): Promise<SSEWikiTypes.GetReviewsResponse> {
    return this.rpcClient.call<SSEWikiTypes.GetReviewsRequest, SSEWikiTypes.GetReviewsResponse>('GetReviews', req)
  }

  async GetReviewDetail(req: SSEWikiTypes.GetReviewDetailRequest): Promise<SSEWikiTypes.GetReviewDetailResponse> {
    return this.rpcClient.call<SSEWikiTypes.GetReviewDetailRequest, SSEWikiTypes.GetReviewDetailResponse>('GetReviewDetail', req)
  }

  async ReviewAction(req: SSEWikiTypes.ReviewActionRequest): Promise<SSEWikiTypes.ReviewActionResponse> {
    return this.rpcClient.call<SSEWikiTypes.ReviewActionRequest, SSEWikiTypes.ReviewActionResponse>('ReviewAction', req)
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
    const protoPath = path.join(import.meta.dirname, '..', 'protobuf', 'proto', 'ssewiki', 'ssewiki.proto')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: 'ssewiki',
      serviceClassName: 'DiscussionService',
      serverAddress: config?.serverAddress || DEFAULT_WIKI_GRPC_ADDRESS,
      ...config?.rpcConfig,
    })
  }

  async GetArticleComments(req: SSEWikiTypes.GetArticleCommentsRequest): Promise<SSEWikiTypes.GetArticleCommentsResponse> {
    return this.rpcClient.call<SSEWikiTypes.GetArticleCommentsRequest, SSEWikiTypes.GetArticleCommentsResponse>('GetArticleComments', req)
  }

  async CreateComment(req: SSEWikiTypes.CreateCommentRequest): Promise<SSEWikiTypes.CreateCommentResponse> {
    return this.rpcClient.call<SSEWikiTypes.CreateCommentRequest, SSEWikiTypes.CreateCommentResponse>('CreateComment', req)
  }

  async ReplyComment(req: SSEWikiTypes.ReplyCommentRequest): Promise<SSEWikiTypes.ReplyCommentResponse> {
    return this.rpcClient.call<SSEWikiTypes.ReplyCommentRequest, SSEWikiTypes.ReplyCommentResponse>('ReplyComment', req)
  }

  async UpdateComment(req: SSEWikiTypes.UpdateCommentRequest): Promise<SSEWikiTypes.UpdateCommentResponse> {
    return this.rpcClient.call<SSEWikiTypes.UpdateCommentRequest, SSEWikiTypes.UpdateCommentResponse>('UpdateComment', req)
  }

  async DeleteComment(req: SSEWikiTypes.DeleteCommentRequest): Promise<SSEWikiTypes.DeleteCommentResponse> {
    return this.rpcClient.call<SSEWikiTypes.DeleteCommentRequest, SSEWikiTypes.DeleteCommentResponse>('DeleteComment', req)
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
