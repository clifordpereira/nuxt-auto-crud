import { createError } from 'h3'
import type { TableWithId } from '#nac/types'

/**
 * Middleware to guard all NAC API routes
 */
export default defineEventHandler(async (event) => {
  const pathname = new URL(event.path, 'http://internal').pathname
  if (isAuthenticationDisabled() || !isPathToGuard(pathname)) return

  const { user } = await requireUserSession(event)
  if (isNacSystemPath(pathname)) return

  const { model, id } = extractModelAndIdFromPath(pathname)
  const action = resolveAction(event.method, Boolean(id))
  if (!action) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  // 1. Initialize NAC context with promotion-ready listAllStatus
  event.context.nac = {
    userId: user.id,
    record: null,
    permissions: user.permissions[model],
  }

  if (isAdmin(user)) return

  // 2. GLOBAL PERMISSION CHECK (The missing piece)
  // If user has global 'list', 'read', 'update', etc., they pass here.
  if (hasPermission(user, model, action)) return

  // 3. OWNERSHIP PERMISSION CHECK
  const ownAction = `${action}_own`
  if (hasPermission(user, model, ownAction)) {
    if (!id) return // for create/list action, let handler decide

    // for update/delete/read actions, check ownership
    const record = await fetchRecord(model, id)
    if (!record) throw createError({ statusCode: 404, statusMessage: 'Not Found' })

    if (isOwner(user, record)) {
      event.context.nac.record = record
      return
    }
  }

  throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
})

/**
 * Helper functions
 */
function isAuthenticationDisabled() {
  const { auth } = useRuntimeConfig().autoCrud
  return auth?.authentication === false
}

function isPathToGuard(pathname: string) {
  return isNacPath(pathname) && !isAgenticPath(pathname)
}

function isNacPath(pathname: string) {
  const { endpointPrefix = '/api/_nac' } = useRuntimeConfig().public.autoCrud
  return pathname.startsWith(endpointPrefix)
}

function isAgenticPath(pathname: string) {
  const agenticPaths = ['/api/_nac/_meta']
  return agenticPaths.includes(pathname)
}

function isNacSystemPath(pathname: string) {
  const { endpointPrefix = '/api/_nac' } = useRuntimeConfig().public.autoCrud
  return pathname.startsWith(endpointPrefix + '/_')
}

function extractModelAndIdFromPath(pathname: string) {
  const { endpointPrefix = '/api/_nac' } = useRuntimeConfig().public.autoCrud
  const relativePath = pathname.slice(endpointPrefix.length).replace(/^\//, '')
  const [model, id] = relativePath.split('/')
  return { model: model || '', id }
}

function resolveAction(method: string, hasId: boolean) {
  switch (method) {
    case 'GET':
      return hasId ? 'read' : 'list'
    case 'POST':
      return 'create'
    case 'PUT':
    case 'PATCH':
      return 'update'
    case 'DELETE':
      return 'delete'
    default:
      return null
  }
}

async function fetchRecord(model: string, id: string) {
  const table = modelTableMap[model] as TableWithId
  if (!table) return null

  try {
    return await getRow(table, id)
  }
  catch {
    return null
  }
}
