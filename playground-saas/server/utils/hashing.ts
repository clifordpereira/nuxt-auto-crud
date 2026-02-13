import { hash, compare } from 'bcryptjs'

export const hashUserPassword = (password: string): Promise<string> => {
  return hash(password, 10)
}

export const verifyUserPassword = (hashed: string, password: string): Promise<boolean> => {
  return compare(password, hashed)
}
