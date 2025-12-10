// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../auth.d.ts" />
import type { H3Event } from 'h3'
import { createError } from 'h3'
// @ts-expect-error - #imports is available in runtime
import { requireUserSession, allows, getUserSession, abilityLogic, abilities as globalAbility } from '#imports'
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
      const guestCheck = !user && (typeof abilityLogic === 'function' ? abilityLogic : typeof globalAbility === 'function' ? globalAbility : null)
      const allowed = guestCheck
        ? await guestCheck(null, model, action)
        : await allows(event, globalAbility, model, action)

      if (!allowed) {
        if (user) throw createError({ statusCode: 403, message: 'Forbidden' })
        return false
      }
      return true
    }
    catch (err) {
      if ((err as { statusCode: number }).statusCode === 403) throw err
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

  if (!auth?.authentication) return

  if (auth.type === 'jwt' && auth.jwtSecret) {
    if (!await verifyJwtToken(event, auth.jwtSecret)) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
    return
  }

  await requireUserSession(event)
}
