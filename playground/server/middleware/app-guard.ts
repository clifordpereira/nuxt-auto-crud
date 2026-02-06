import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const pathname = new URL(event.path, 'http://internal').pathname
  if (isAuthenticationDisabled() || !isPathToGuard(pathname)) return

  const session = await getUserSession(event)
  const user = session.user

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { model, id } = extractModelAndId(pathname)

  const action = resolveAction(event.method, Boolean(id))
  if (!action) return

  // Admin bypass
  if (user.role === 'admin') return

  // Check permissions
  if (!hasPermission(user, model, action)) {
    const ownAction = `${action}_own`
    if (hasPermission(user, model, ownAction)) {
      // Allowed to proceed to endpoint for ownership verification
      return
    }

    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }
})

/**
 * Helper functions
 */

// @ts-expect-error - permissions is extended on user session
function hasPermission(user: { permissions?: Record<string, string[]> }, model: string, action: string) {
  if (!user.permissions || !user.permissions[model]) return false
  return user.permissions[model].includes(action)
}

function isAuthenticationDisabled() {
  const { auth } = useAutoCrudConfig()
  return auth?.authentication === false
}

function isPathToGuard(pathname: string) {
  const { endpointPrefix = '/api/_nac' } = useAutoCrudConfig()
  return pathname.startsWith(endpointPrefix) && !isAgenticPath(pathname)
}

function isAgenticPath(pathname: string) {
  const agenticPaths = ['/api/_nac/_meta', '/api/_nac/_sse']
  return agenticPaths.includes(pathname)
}

function extractModelAndId(pathname: string) {
  const { endpointPrefix = '/api/_nac' } = useAutoCrudConfig()
  const relativePath = pathname.slice(endpointPrefix.length).replace(/^\//, '')
  const segments = relativePath.split('/')
  const model = segments[0] ?? ''
  const id = segments[1]
  return { model, id }
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
