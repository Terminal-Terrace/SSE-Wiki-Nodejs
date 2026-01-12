export interface UserInfo {
  id: number
  username: string
}

export interface ModuleTreeNode {
  id: number
  name: string
  description: string
  owner_id: number
  is_moderator: boolean
  children: ModuleTreeNode[]
  role: string
}

export interface Module {
  id: number
  name: string
  description: string
  parent_id: number
  owner_id: number
  created_at: string
  updated_at: string
}

export interface BreadcrumbNode {
  id: number
  name: string
}

export interface ModeratorInfo {
  user_id: number
  username: string
  role: string
  created_at: string
}

export interface LockInfo {
  success: boolean
  locked_by: UserInfo
  locked_at: string
}

export interface GetModuleTreeRequest {

}

export interface GetModuleTreeResponse {
  tree: ModuleTreeNode[]
}

export interface GetModuleRequest {
  id: number
}

export interface GetModuleResponse {
  module: Module
}

export interface GetBreadcrumbsRequest {
  module_id: number
}

export interface GetBreadcrumbsResponse {
  breadcrumbs: BreadcrumbNode[]
}

export interface CreateModuleRequest {
  name: string
  description?: string
  parent_id: number
}

export interface CreateModuleResponse {
  module: Module
}

export interface UpdateModuleRequest {
  id: number
  name: string
  description?: string
  parent_id: number
}

export interface UpdateModuleResponse {

}

export interface DeleteModuleRequest {
  id: number
}

export interface DeleteModuleResponse {
  deleted_modules: number
}

export interface GetModeratorsRequest {
  module_id: number
}

export interface GetModeratorsResponse {
  moderators: ModeratorInfo[]
}

export interface AddModeratorRequest {
  module_id: number
  target_user_id: number
  role: string
}

export interface AddModeratorResponse {

}

export interface RemoveModeratorRequest {
  module_id: number
  target_user_id: number
}

export interface RemoveModeratorResponse {

}

export interface HandleLockRequest {
  module_id: number
  action: string
}

export interface HandleLockResponse {
  lock_info: LockInfo
}
