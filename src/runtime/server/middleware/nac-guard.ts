import { defineEventHandler, getQuery } from 'h3'
import { AuthenticationError } from '../exceptions'

export default defineEventHandler(async (event) => {
  const pathname = new URL(event.path, 'http://internal').pathname
  const config = useRuntimeConfig(event)
  const { nacEndpointPrefix } = config.public.autoCrud

  if (!isNacPath(pathname, nacEndpointPrefix)) return

  event.context.nac ||= { userId: null, isPublic: false }

  // Non-agentic paths - normal auth
  if (!isAgenticPath(pathname)) {
    const isAuthEnabled = config.autoCrud.auth?.authentication
    const isUserAuthenticated = Boolean(event.context.nac?.userId)

    if (isAuthEnabled && !isUserAuthenticated) {
      const model = getModelName(pathname, nacEndpointPrefix)
      if (model && isPublicResource(model)) {
        event.context.nac.isPublic = true
      }
      else {
        throw new AuthenticationError('Unauthorized').toH3()
      }
    }

    return
  }

  // Agentic paths - token auth
  const token = getQuery(event).token as string | undefined
  const { agenticToken } = config.autoCrud

  if (!agenticToken || token !== agenticToken) {
    throw new AuthenticationError('Invalid agentic token').toH3()
  }
})

function getModelName(pathname: string, nacEndpointPrefix: string) {
  const regex = new RegExp(`^${nacEndpointPrefix}/([^/]+)`)
  const match = pathname.match(regex)
  return match ? match[1] : null
}

function isPublicResource(model: string) {
  const { publicResources } = useRuntimeConfig().autoCrud
  return Object.keys(publicResources || {}).includes(model)
}

function isAgenticPath(pathname: string) {
  return pathname.includes('/_meta')
}

function isNacPath(pathname: string, nacEndpointPrefix: string) {
  return pathname.startsWith(nacEndpointPrefix)
}