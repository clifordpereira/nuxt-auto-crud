import { jwtVerify } from 'jose'
import type { H3Event } from 'h3'
import { getRequestHeader } from 'h3'

export async function verifyJwtToken(event: H3Event, secret: string): Promise<boolean> {
  const authHeader = getRequestHeader(event, 'Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return false
  }
  try {
    const secretKey = new TextEncoder().encode(secret)
    await jwtVerify(token, secretKey)
    return true
  }
  catch {
    return false
  }
}
