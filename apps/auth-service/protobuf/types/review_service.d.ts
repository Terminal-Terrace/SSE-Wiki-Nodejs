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

export interface GetReviewsRequest {
  status: string
  article_id: number
}

export interface GetReviewsResponse {
  submissions: Submission[]
}

export interface GetReviewDetailRequest {
  submission_id: number
  user_id: number
  user_role: string
}

export interface ReviewDetail {
  submission: Submission
  proposed_version: Version
  base_version: Version
  article: Article
}

export interface GetReviewDetailResponse {
  detail: ReviewDetail
}

export interface ReviewActionRequest {
  submission_id: number
  action: string
  notes: string
  merged_content: string
  reviewer_id: number
  user_role: string
}

export interface ReviewActionResponse {
  message: string
  published_version: Version
  conflict_data: ConflictData
}
