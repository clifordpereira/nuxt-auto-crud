// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../auth.d.ts" />
import type { H3Event } from 'h3'
import { createError } from 'h3'
import globalAbility from '#site/ability'
// @ts-expect-error - abilityLogic is a named export we added
import { abilityLogic } from '#site/ability'
// @ts-expect-error - #imports is available in runtime
import { requireUserSession, allows, getUserSession } from '#imports'
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
  let user = null
  try {
    const session = await getUserSession(event)
    user = session.user
  }
  catch {
    // No session or error fetching session
  }

  // Check authorization if enabled
  if (auth.authorization) {
    try {
      let allowed = false
      if (user) {
         allowed = await allows(event, globalAbility, model, action)
      } else {
         // Try to call the raw logic if available, otherwise fall back to globalAbility
         if (typeof abilityLogic === 'function') {
            allowed = await abilityLogic(null, model, action)
         } else if (typeof globalAbility === 'function') {
            // Calling ability directly
            allowed = await globalAbility(null, model, action)
         } else {
            // If it's not a function, maybe allows handles null user?
            allowed = await allows(event, globalAbility, model, action)
         }
      }
      
      if (!allowed) {
        // If user is logged in, this is Forbidden (403)
        if (user) {
          throw createError({
            statusCode: 403,
            message: 'Forbidden',
          })
        }
        // If guest, return false to allow fallback to resourceConfig
        return false
      }
      // Allowed by ability (either user or guest)
      return true
    } catch (err) {
      // If it's a 403 (Forbidden) from our ability check, rethrow it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((err as any).statusCode === 403) {
        throw err
      }
      // Otherwise (401 from requireUserSession or function not available), return false (treat as guest)
      return false
    }
  }

  // If authorization is NOT enabled, we rely on authentication only.
  if (user) {
    return true
  }

  return false
}

export async function ensureAuthenticated(event: H3Event): Promise<void> {
  const { auth } = useAutoCrudConfig()

  if (!auth?.authentication) {
    return
  }

  let isAuthenticated = false
  if (auth.type === 'jwt' && auth.jwtSecret) {
    isAuthenticated = await verifyJwtToken(event, auth.jwtSecret)
  }
  else {
    try {
      await requireUserSession(event)
      isAuthenticated = true
    }
    catch {
      isAuthenticated = false
    }
  }

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
}
