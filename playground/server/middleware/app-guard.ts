import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const pathname = new URL(event.path, 'http://internal').pathname
  if (isAuthenticationDisabled() || !isPathToGuard(pathname)) return

  const { user } = await requireUserSession(event)

  if (isNacSystemPath(pathname)) return // No need to authorize system paths
  
  if (user.role === 'admin') return // Admins can do everything

  const { model, id } =   extractModelAndIdFromPath(pathname)

  const action = resolveAction(event.method, Boolean(id))
  if (!action) throw createError({ statusCode: 403, statusMessage: 'Forbidden'})

  if (hasPermission(user, model, action)) return

  const ownAction = `${action}_own`
  if (hasPermission(user, model, ownAction)) return

  throw createError({ statusCode: 403, statusMessage: 'Forbidden'})
})

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
