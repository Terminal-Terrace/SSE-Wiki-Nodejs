export interface UserInfo {
  id: number
  username: string
}

export interface Comment {
  id: number
  discussion_id: number
  parent_id: number
  content: string
  created_by: number
  creator: UserInfo
  created_at: string
  updated_at: string
  is_deleted: boolean
  replies: Comment[]
  reply_count: number
}

export interface Discussion {
  id: number
  article_id: number
  title: string
  created_at: string
  updated_at: string
  comments: Comment[]
  comment_count: number
}

export interface GetArticleCommentsRequest {
  article_id: number
}

export interface GetArticleCommentsResponse {
  comments: Comment[]
  total: number
}

export interface CreateCommentRequest {
  article_id: number
  content: string
  user_id: number
}

export interface CreateCommentResponse {
  comment: Comment
}

export interface ReplyCommentRequest {
  comment_id: number
  content: string
  user_id: number
}

export interface ReplyCommentResponse {
  comment: Comment
}

export interface UpdateCommentRequest {
  comment_id: number
  content: string
  user_id: number
}

export interface UpdateCommentResponse {
  comment: Comment
}

export interface DeleteCommentRequest {
  comment_id: number
  user_id: number
}

export interface DeleteCommentResponse {

}
