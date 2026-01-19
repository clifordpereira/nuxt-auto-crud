// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../auth.d.ts" />
import type { H3Event } from 'h3'
import { createError } from 'h3'

// @ts-expect-error - #imports is a virtual alias
import { requireUserSession, allows, getUserSession, abilities as globalAbility, abilityLogic } from '#imports'
import { useAutoCrudConfig } from './config'
import { verifyJwtToken } from './jwt'

export async function checkAdminAccess(event: H3Event, model: string, action: string, context?: unknown): Promise<boolean> {
  const { auth } = useAutoCrudConfig()

  if (!auth?.authentication) {
    return true
  }

  // 1. Bearer Token or Query Check (Agentic/MCP Tooling)
  const authHeader = getHeader(event, 'authorization')
  const query = getQuery(event)
  const apiToken = useRuntimeConfig(event).apiSecretToken

  // Extract token from Header or fallback to Query param
  const token = (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || query.token

  if (token && apiToken && token === apiToken) {
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
    const session = await (getUserSession as (event: H3Event) => Promise<{ user: { id: string | number, permissions?: Record<string, string[]> } | null }>)(event)
    user = session.user
  }
  catch {
    // No session or error fetching session
  }

  // Check authorization if enabled
  if (auth.authorization) {
    try {
      const guestCheck = !user && (typeof abilityLogic === 'function' ? abilityLogic : (typeof globalAbility === 'function' ? globalAbility : null))

      const allowed = guestCheck
        ? await (guestCheck as (user: unknown, model: string, action: string, context?: unknown) => Promise<boolean>)(null, model, action, context)
        : await (allows as (event: H3Event, ability: unknown, model: string, action: string, context?: unknown) => Promise<boolean>)(event, globalAbility, model, action, context)

      if (!allowed) {
        // Fallback: Check for "Own Record" permission (e.g. update_own, delete_own)
        if (user && (action === 'read' || action === 'update' || action === 'delete') && context && typeof context === 'object' && 'id' in context) {
          const ownAction = `${action}_own`
          const userPermissions = user.permissions?.[model] as string[] | undefined

          if (userPermissions && userPermissions.includes(ownAction)) {
            // Verify ownership via DB
            // @ts-expect-error - hub:db virtual alias
            const { db } = await import('hub:db')
            const { getTableForModel } = await import('./modelMapper')
            const { eq } = await import('drizzle-orm')

            try {
              const table = getTableForModel(model)

              // Special case: User updating their own profile (record.id === user.id)
              if (model === 'users' && String((context as { id: string | number }).id) === String(user.id)) {
                return true
              }

              // Standard case: Check 'createdBy' or 'userId' column for ownership

              const hasCreatedBy = 'createdBy' in table
              const hasUserId = 'userId' in table

              if (hasCreatedBy || hasUserId) {
                // @ts-expect-error - table is dynamic
                const query = db.select().from(table).where(eq(table.id, Number(context.id)))
                const record = await query.get()

                if (record) {
                  // Check createdBy
                  if (hasCreatedBy) {
                    if (String(record.createdBy) === String(user.id)) return true
                  }
                  // Check userId (legacy)
                  if (hasUserId) {
                    if (String(record.userId) === String(user.id)) return true
                  }
                }
              }
            }
            catch (e) {
              console.error('[checkAdminAccess] Ownership check failed', e)
            }
          }
        }

        if (user) throw createError({ statusCode: 403, message: 'Forbidden' })
        return false
      }
      return true
    }
    catch (err) {
      if ((err as { statusCode: number }).statusCode === 403) throw err
      console.error('[checkAdminAccess] Error', err)
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
  const runtimeConfig = useRuntimeConfig(event)

  if (!auth?.authentication) return

  // Extract Token: Priority 1: Authorization Header | Priority 2: Query String (?token=)
  const authHeader = getHeader(event, 'authorization')
  const query = getQuery(event)
  const apiToken = runtimeConfig.apiSecretToken

  const token = (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || query.token

  // 1. API Token Check (Agentic/MCP)
  if (token && apiToken && token === apiToken) {
    return
  }

  // 2. JWT Check
  if (auth.type === 'jwt' && auth.jwtSecret) {
    if (await verifyJwtToken(event, auth.jwtSecret)) return
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // 3. Session Check (Standard UI)
  await (requireUserSession as (event: H3Event) => Promise<void>)(event)
}
