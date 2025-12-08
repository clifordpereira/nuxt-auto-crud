// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../auth.d.ts" />
import type { H3Event } from 'h3'
import { createError } from 'h3'
import globalAbility from '#site/ability'
// @ts-expect-error - #imports is available in runtime
import { requireUserSession, allows } from '#imports'
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
  try {
    await requireUserSession(event)

    // Check authorization if enabled
    if (auth.authorization) {
      const allowed = await allows(event, globalAbility, model, action)
      if (!allowed) {
        throw createError({
          statusCode: 403,
          message: 'Forbidden',
        })
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
    // Otherwise (401 from requireUserSession or function not available), return false (treat as guest)
    return false
  }
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
