import type { RpcClientConfig } from '@sse-wiki/rpc-client'
import type * as ArticleServiceTypes from './types/article_service'
import type * as AuthServiceTypes from './types/auth_service'
import type * as DiscussionServiceTypes from './types/discussion_service'
import type * as ModuleServiceTypes from './types/module_service'
import type * as ReviewServiceTypes from './types/review_service'
import path from 'node:path'
import { RpcClient } from '@sse-wiki/rpc-client'

/**
 * 服务客户端配置
 */
export interface ServiceConfig {
  serverAddress?: string
  /** 其他 RpcClient 配置 */
  rpcConfig?: Partial<Omit<RpcClientConfig, 'protoPath' | 'packageName' | 'serviceClassName' | 'serverAddress'>>
}

/**
 * AuthService 客户端
 *
 * 使用示例：
 * ```typescript
 * const client = new AuthService()
 * const response = await client.GetUser({ id: 123 })
 * ```
 */
export class AuthService {
  private rpcClient: RpcClient

  /**
   * 创建 AuthService 客户端
   * @param config 可选配置
   */
  constructor(config?: ServiceConfig) {
    const protoPath = path.join(import.meta.dirname, 'proto', 'auth_service', 'auth_service.proto')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: 'auth_service',
      serviceClassName: 'AuthService',
      serverAddress: config?.serverAddress || 'localhost:50051',
      ...config?.rpcConfig,
    })
  }

  async Prelogin(req: AuthServiceTypes.PreloginRequest): Promise<AuthServiceTypes.PreloginResponse> {
    return this.rpcClient.call<AuthServiceTypes.PreloginRequest, AuthServiceTypes.PreloginResponse>('Prelogin', req)
  }

  async SendCode(req: AuthServiceTypes.CodeRequest): Promise<AuthServiceTypes.CodeResponse> {
    return this.rpcClient.call<AuthServiceTypes.CodeRequest, AuthServiceTypes.CodeResponse>('SendCode', req)
  }

  async Login(req: AuthServiceTypes.LoginRequest): Promise<AuthServiceTypes.LoginResponse> {
    return this.rpcClient.call<AuthServiceTypes.LoginRequest, AuthServiceTypes.LoginResponse>('Login', req)
  }

  async Logout(req: AuthServiceTypes.LogoutRequest): Promise<AuthServiceTypes.LogoutResponse> {
    return this.rpcClient.call<AuthServiceTypes.LogoutRequest, AuthServiceTypes.LogoutResponse>('Logout', req)
  }

  async GetUserInfo(req: AuthServiceTypes.InfoRequest): Promise<AuthServiceTypes.InfoResponse> {
    return this.rpcClient.call<AuthServiceTypes.InfoRequest, AuthServiceTypes.InfoResponse>('GetUserInfo', req)
  }

  async RefreshToken(req: AuthServiceTypes.RefreshRequest): Promise<AuthServiceTypes.RefreshResponse> {
    return this.rpcClient.call<AuthServiceTypes.RefreshRequest, AuthServiceTypes.RefreshResponse>('RefreshToken', req)
  }

  async Register(req: AuthServiceTypes.RegisterRequest): Promise<AuthServiceTypes.RegisterResponse> {
    return this.rpcClient.call<AuthServiceTypes.RegisterRequest, AuthServiceTypes.RegisterResponse>('Register', req)
  }

  /**
   * 关闭 gRPC 连接
   */
  close(): void {
    this.rpcClient.close()
  }

  /**
   * 等待连接就绪
   * @param deadline 超时时间（毫秒）
   */
  async waitForReady(deadline?: number): Promise<void> {
    return this.rpcClient.waitForReady(deadline)
  }
}

/**
 * ArticleService 客户端
 *
 * 使用示例：
 * ```typescript
 * const client = new ArticleService()
 * const response = await client.GetUser({ id: 123 })
 * ```
 */
export class ArticleService {
  private rpcClient: RpcClient

  /**
   * 创建 ArticleService 客户端
   * @param config 可选配置
   */
  constructor(config?: ServiceConfig) {
    const protoPath = path.join(import.meta.dirname, 'proto', 'article_service', 'article_service.proto')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: 'article_service',
      serviceClassName: 'ArticleService',
      serverAddress: config?.serverAddress || 'localhost:50051',
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

  /**
   * 关闭 gRPC 连接
   */
  close(): void {
    this.rpcClient.close()
  }

  /**
   * 等待连接就绪
   * @param deadline 超时时间（毫秒）
   */
  async waitForReady(deadline?: number): Promise<void> {
    return this.rpcClient.waitForReady(deadline)
  }
}

/**
 * ModuleService 客户端
 *
 * 使用示例：
 * ```typescript
 * const client = new ModuleService()
 * const response = await client.GetUser({ id: 123 })
 * ```
 */
export class ModuleService {
  private rpcClient: RpcClient

  /**
   * 创建 ModuleService 客户端
   * @param config 可选配置
   */
  constructor(config?: ServiceConfig) {
    const protoPath = path.join(import.meta.dirname, 'proto', 'module_service', 'module_service.proto')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: 'module_service',
      serviceClassName: 'ModuleService',
      serverAddress: config?.serverAddress || 'localhost:50051',
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

  /**
   * 关闭 gRPC 连接
   */
  close(): void {
    this.rpcClient.close()
  }

  /**
   * 等待连接就绪
   * @param deadline 超时时间（毫秒）
   */
  async waitForReady(deadline?: number): Promise<void> {
    return this.rpcClient.waitForReady(deadline)
  }
}

/**
 * ReviewService 客户端
 *
 * 使用示例：
 * ```typescript
 * const client = new ReviewService()
 * const response = await client.GetUser({ id: 123 })
 * ```
 */
export class ReviewService {
  private rpcClient: RpcClient

  /**
   * 创建 ReviewService 客户端
   * @param config 可选配置
   */
  constructor(config?: ServiceConfig) {
    const protoPath = path.join(import.meta.dirname, 'proto', 'review_service', 'review_service.proto')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: 'review_service',
      serviceClassName: 'ReviewService',
      serverAddress: config?.serverAddress || 'localhost:50051',
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

  /**
   * 关闭 gRPC 连接
   */
  close(): void {
    this.rpcClient.close()
  }

  /**
   * 等待连接就绪
   * @param deadline 超时时间（毫秒）
   */
  async waitForReady(deadline?: number): Promise<void> {
    return this.rpcClient.waitForReady(deadline)
  }
}

/**
 * DiscussionService 客户端
 *
 * 使用示例：
 * ```typescript
 * const client = new DiscussionService()
 * const response = await client.GetUser({ id: 123 })
 * ```
 */
export class DiscussionService {
  private rpcClient: RpcClient

  /**
   * 创建 DiscussionService 客户端
   * @param config 可选配置
   */
  constructor(config?: ServiceConfig) {
    const protoPath = path.join(import.meta.dirname, 'proto', 'discussion_service', 'discussion_service.proto')

    this.rpcClient = new RpcClient({
      protoPath,
      packageName: 'discussion_service',
      serviceClassName: 'DiscussionService',
      serverAddress: config?.serverAddress || 'localhost:50051',
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

  /**
   * 关闭 gRPC 连接
   */
  close(): void {
    this.rpcClient.close()
  }

  /**
   * 等待连接就绪
   * @param deadline 超时时间（毫秒）
   */
  async waitForReady(deadline?: number): Promise<void> {
    return this.rpcClient.waitForReady(deadline)
  }
}
