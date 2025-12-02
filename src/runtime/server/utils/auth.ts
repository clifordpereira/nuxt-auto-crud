import type { H3Event } from 'h3'
import { createError } from 'h3'
import { useAutoCrudConfig } from './config'
import { verifyJwtToken } from './jwt'

export async function checkAdminAccess(event: H3Event, model: string, action: string): Promise<boolean> {
  const { auth } = useAutoCrudConfig()

  if (!auth?.authentication) {
    return true
  }

  if (auth.type === 'jwt') {
    if (!auth.jwtSecret) {
      console.warn('JWT Secret is not configured but auth type is jwt')
      return false
    }
    return verifyJwtToken(event, auth.jwtSecret)
  }

  // Session based (default)
  // @ts-expect-error - requireUserSession is auto-imported
  if (typeof requireUserSession !== 'function') {
    throw new TypeError('requireUserSession is not available')
  }

  try {
    // @ts-expect-error - requireUserSession is auto-imported
    await requireUserSession(event)

    // Check authorization if enabled
    if (auth.authorization) {
      if (event.context.ability) {
        const can = event.context.ability.can(action, model)
        if (!can) {
          throw createError({
            statusCode: 403,
            message: 'Forbidden',
          })
        }
      }
    }

    return true
  }
  catch (e: unknown) {
    // If it's a 403 (Forbidden) from our ability check, rethrow it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((e as any).statusCode === 403) {
      throw e
    }
    // Otherwise (401 from requireUserSession), return false (treat as guest)
    return false
  }
}
