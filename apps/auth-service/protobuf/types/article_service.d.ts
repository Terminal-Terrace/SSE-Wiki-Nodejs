export interface ArticleListItem {
  id: number
  title: string
  module_id: number
  current_version_id: number
  view_count: number
  tags: string[]
  created_by: number
  created_at: string
  updated_at: string
}

export interface Article {
  id: number
  title: string
  module_id: number
  content: string
  commit_message: string
  version_number: number
  current_version_id: number
  current_user_role: string
  is_review_required: boolean
  view_count: number
  tags: string[]
  pending_submissions: PendingSubmission[]
  created_by: number
  created_at: string
  updated_at: string
  history: HistoryEntry[]
}

export interface HistoryEntry {
  entry_type: string
  entry_id: number
  version_id: number
  submission_id: number
  status: string
  submission_status: string
  base_version_id: number
  merged_against_version_id: number
  has_conflict: boolean
  merge_result: string
  commit_message: string
  author_id: number
  reviewed_by: number
  review_notes: string
  created_at: string
  reviewed_at: string
}

export interface PendingSubmission {
  id: number
  submitted_by: number
  submitted_by_name: string
  status: string
  created_at: string
}

export interface Version {
  id: number
  article_id: number
  version_number: number
  content: string
  commit_message: string
  author_id: number
  status: string
  created_at: string
}

export interface VersionDiff {
  base_content: string
  current_content: string
  base_version_number: number
  current_version_number: number
}

export interface Submission {
  id: number
  article_id: number
  article_title: string
  proposed_version_id: number
  base_version_id: number
  submitted_by: number
  submitted_by_name: string
  reviewed_by: number
  status: string
  commit_message: string
  has_conflict: boolean
  ai_score: number
  created_at: string
  reviewed_at: string
}

export interface ConflictData {
  base_content: string
  their_content: string
  our_content: string
  has_conflict: boolean
  base_version_number: number
  current_version_number: number
  submitter_name: string
}

export interface GetArticlesByModuleRequest {
  module_id: number
  page: number
  page_size: number
}

export interface GetArticlesByModuleResponse {
  total: string
  page: number
  page_size: number
  articles: ArticleListItem[]
}

export interface GetArticleRequest {
  id: number
  user_id: number
  user_role: string
}

export interface GetArticleResponse {
  article: Article
}

export interface GetVersionsRequest {
  article_id: number
}

export interface GetVersionsResponse {
  versions: Version[]
}

export interface GetVersionRequest {
  id: number
}

export interface GetVersionResponse {
  version: Version
}

export interface GetVersionDiffRequest {
  version_id: number
}

export interface GetVersionDiffResponse {
  base_version: Version
  current_version: Version
}

export interface CreateArticleRequest {
  title: string
  module_id: number
  content: string
  commit_message: string
  is_review_required: boolean
  tags: string[]
  user_id: number
}

export interface CreateArticleResponse {
  article: Article
}

export interface CreateSubmissionRequest {
  article_id: number
  content: string
  commit_message: string
  base_version_id: number
  user_id: number
  user_role: string
}

export interface CreateSubmissionResponse {
  published: boolean
  need_review: boolean
  message: string
  submission: Submission
  published_version: Version
  conflict_data: ConflictData
}

export interface UpdateBasicInfoRequest {
  article_id: number
  title: string
  tags: string[]
  is_review_required: boolean
  has_title: boolean
  has_tags: boolean
  has_is_review_required: boolean
  user_id: number
  user_role: string
}

export interface UpdateBasicInfoResponse {

}

export interface AddCollaboratorRequest {
  article_id: number
  target_user_id: number
  role: string
  user_id: number
  user_role: string
}

export interface AddCollaboratorResponse {

}

export interface GetArticleFavouritesRequest {
  user_id: string
}

export interface GetArticleFavouritesResponse {
  id: number[]
}
