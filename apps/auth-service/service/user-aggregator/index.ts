import type { PublicUserInfo as GrpcPublicUserInfo } from '../../protobuf/types/auth_service'
import type { ModeratorInfo } from '../../protobuf/types/module_service'
import process from 'node:process'
import { AuthService } from '../../protobuf/protoclasses'

// 单例 gRPC 客户端
const grpcAddress = process.env.GRPC_ADDRESS || 'localhost:50051'
const authClient = new AuthService({ serverAddress: grpcAddress })

/**
 * 公开用户信息（不含 email）
 */
export interface PublicUserInfo {
  id: number
  username: string
  avatar: string
}

/**
 * 协作者完整信息（包含用户详情）
 */
export interface CollaboratorInfo {
  user_id: number
  username: string
  avatar: string
  role: string
  created_at: string
}

/**
 * 搜索用户响应
 */
export interface SearchUsersResult {
  users: PublicUserInfo[]
  total: number
}

/**
 * UserAggregatorService - 用户信息聚合服务
 *
 * 负责：
 * 1. 搜索用户（不暴露 email）
 * 2. 批量获取用户公开信息
 * 3. 聚合协作者信息（添加用户详情）
 */
export const userAggregatorService = {
  /**
   * 搜索用户
   * 通过 auth_service gRPC 搜索用户，返回 PublicUserInfo（不含 email）
   *
   * @param keyword 搜索关键词（用户名模糊匹配）
   * @param excludeUserId 排除的用户ID（通常是当前用户）
   * @param page 页码，从1开始
   * @param pageSize 每页数量，默认10
   */
  async searchUsers(
    keyword: string,
    excludeUserId: number = 0,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<SearchUsersResult> {
    // 处理空白关键词
    const trimmedKeyword = keyword?.trim() || ''
    if (!trimmedKeyword) {
      return { users: [], total: 0 }
    }

    try {
      const response = await authClient.SearchUsers({
        keyword: trimmedKeyword,
        exclude_user_id: excludeUserId,
        page,
        page_size: pageSize,
      })

      // 转换 gRPC 响应为本地类型
      const users: PublicUserInfo[] = (response.users || []).map((u: GrpcPublicUserInfo) => ({
        id: u.id,
        username: u.username || '',
        avatar: u.avatar || '',
      }))

      return {
        users,
        total: Number(response.total) || 0,
      }
    }
    catch (err) {
      console.error('[searchUsers] gRPC error:', err)
      return { users: [], total: 0 }
    }
  },

  /**
   * 批量获取用户公开信息
   * 通过 auth_service gRPC 批量获取用户信息，返回 PublicUserInfo（不含 email）
   *
   * @param userIds 用户ID列表
   * @returns Map<userId, PublicUserInfo>
   */
  async getUsersByIds(userIds: number[]): Promise<Map<number, PublicUserInfo>> {
    const result = new Map<number, PublicUserInfo>()

    if (!userIds || userIds.length === 0) {
      return result
    }

    // 去重
    const uniqueIds = [...new Set(userIds)]

    try {
      const response = await authClient.GetUsersByIds({
        user_ids: uniqueIds,
      })

      // 将响应转换为 Map
      for (const user of response.users || []) {
        result.set(user.id, {
          id: user.id,
          username: user.username || '',
          avatar: user.avatar || '',
        })
      }

      // 对于未找到的用户，返回降级数据
      for (const userId of uniqueIds) {
        if (!result.has(userId)) {
          result.set(userId, {
            id: userId,
            username: '',
            avatar: '',
          })
        }
      }
    }
    catch (err) {
      console.error('[getUsersByIds] gRPC error:', err)
      // 出错时返回降级数据
      for (const userId of uniqueIds) {
        result.set(userId, {
          id: userId,
          username: '',
          avatar: '',
        })
      }
    }

    return result
  },

  /**
   * 获取单个用户公开信息
   *
   * @param userId 用户ID
   * @returns PublicUserInfo 或 null
   */
  async getUserById(userId: number): Promise<PublicUserInfo | null> {
    try {
      const userMap = await this.getUsersByIds([userId])
      const user = userMap.get(userId)
      // 如果用户名为空，说明是降级数据，用户不存在
      if (user && user.username) {
        return user
      }
      return null
    }
    catch {
      return null
    }
  },

  /**
   * 检查用户是否存在
   *
   * @param userId 用户ID
   */
  async userExists(userId: number): Promise<boolean> {
    const user = await this.getUserById(userId)
    return user !== null
  },

  /**
   * 聚合协作者信息
   * 将协作者关系数据与用户详情合并
   *
   * @param moderators 协作者关系列表（来自 sse-wiki 服务）
   * @returns 包含完整用户信息的协作者列表
   */
  async enrichModerators(moderators: ModeratorInfo[]): Promise<CollaboratorInfo[]> {
    if (!moderators || moderators.length === 0) {
      return []
    }

    // 提取所有用户ID
    const userIds = moderators.map(m => m.user_id)

    // 批量获取用户信息
    const userInfoMap = await this.getUsersByIds(userIds)

    // 聚合数据
    return moderators.map((m) => {
      const userInfo = userInfoMap.get(m.user_id)
      return {
        user_id: m.user_id,
        username: userInfo?.username || m.username || '',
        avatar: userInfo?.avatar || '',
        role: m.role,
        created_at: m.created_at,
      }
    })
  },

  /**
   * 聚合通用协作者信息
   * 适用于任何包含 user_id 的协作者数据
   *
   * @param collaborators 协作者列表
   * @returns 包含完整用户信息的协作者列表
   */
  async enrichCollaborators<T extends { user_id: number, role: string, created_at: string }>(
    collaborators: T[],
  ): Promise<CollaboratorInfo[]> {
    if (!collaborators || collaborators.length === 0) {
      return []
    }

    // 提取所有用户ID
    const userIds = collaborators.map(c => c.user_id)

    // 批量获取用户信息
    const userInfoMap = await this.getUsersByIds(userIds)

    // 聚合数据
    return collaborators.map((c) => {
      const userInfo = userInfoMap.get(c.user_id)
      return {
        user_id: c.user_id,
        username: userInfo?.username || '',
        avatar: userInfo?.avatar || '',
        role: c.role,
        created_at: c.created_at,
      }
    })
  },
}

export default userAggregatorService
