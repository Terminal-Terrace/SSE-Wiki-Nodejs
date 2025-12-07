export type Values<T> = T[keyof T]

export interface User {
  userId: string
  username?: string
  [key: string]: any
}
