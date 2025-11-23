export enum CodeType {
  REGISTRATION = 0,
  PASSWORD_RESET = 1,
}

export enum LoginType {
  STANDARD = 0,
  GITHUB = 1,
  SSE_MARKET = 2,
}

export interface AuthUser {
  user_id: string
  username: string
  email: string
  role: string
}

export interface CodeRequest {
  email: string
  type: CodeType
}

export interface CodeResponse {

}

export interface LoginRequest {
  username: string
  password: string
  code: string
  type: LoginType
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
}

export interface LogoutRequest {
  user_id: string
}

export interface LogoutResponse {

}

export interface InfoRequest {
  user_id: string
}

export interface InfoResponse {
  user: AuthUser
}

export interface RefreshRequest {
  refresh_token: string
}

export interface RefreshResponse {
  access_token: string
  refresh_token: string
}

export interface RegisterRequest {
  username: string
  password: string
  email: string
  code: string
}

export interface RegisterResponse {
  refresh_token: string
}
