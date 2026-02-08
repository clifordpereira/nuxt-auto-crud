import { createError } from 'h3'
import type { User } from '#auth-utils'
import { eq } from 'drizzle-orm'

/**
 * Middleware to guard all NAC API routes
 */
export default defineEventHandler(async (event) => {
  const pathname = new URL(event.path, 'http://internal').pathname
  if (isAuthenticationDisabled() || !isPathToGuard(pathname)) return

  const { user } = await requireUserSession(event)

  if (isNacSystemPath(pathname)) return // No need to authorize system paths
  
  if (user.role === 'admin') return // Admins can do everything

  // Authorize CRUD endpoints
  const { model, id } =   extractModelAndIdFromPath(pathname)
  const action = resolveAction(event.method, Boolean(id))
  if (!action) throw createError({ statusCode: 403, statusMessage: 'Forbidden'})
  if (hasPermission(user, model, action)) return

  // If action permitted only on own records
  const ownAction = `${action}_own`
  if (hasPermission(user, model, ownAction)) {
    if (!id) {
      // Signal the 'list' handler to append a WHERE clause with the user's ID; eg: list posts createdBy user
      event.context.nacAuth = { restriction: 'own', userId: user.id }
      return
    }

    // For read/update/delete, verify ownership
    const record = await fetchRecord(model, id)
    if (!record) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
    if (isOwner(user, record)) {
       // Attach the record to context to reuse it in the handler
       event.context.nacRecord = record
       return
    }
  }

  throw createError({ statusCode: 403, statusMessage: 'Forbidden'})
})

/**
 * Helper functions
 */
function isAuthenticationDisabled() {
  const { auth } = useAutoCrudConfig()
  return auth?.authentication === false
}

function isPathToGuard(pathname: string) {
  return isNacPath(pathname) && !isAgenticPath(pathname)
}

function isNacPath(pathname: string) {
  const { endpointPrefix = '/api/_nac' } = useAutoCrudConfig()
  return pathname.startsWith(endpointPrefix)
}

function isAgenticPath(pathname: string) {
  const agenticPaths = ['/api/_nac/_meta']
  return agenticPaths.includes(pathname)
}

function isNacSystemPath(pathname: string) {
  const { endpointPrefix = '/api/_nac' } = useAutoCrudConfig()
  return pathname.startsWith(endpointPrefix + '/_')
}

function extractModelAndIdFromPath(pathname: string) {
  const { endpointPrefix = '/api/_nac' } = useAutoCrudConfig()
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
  const { db, schema } = await import('hub:db')
  const table = (schema as any)[model]
  if (!table) return null
  
  const records = await db.select().from(table).where(eq(table.id, id)).limit(1)
  return records[0] || null
}

function isOwner(user: User, record: Record<string, any>, ownerKey: string = 'createdBy'): boolean {
  return user.id === record[ownerKey];
}