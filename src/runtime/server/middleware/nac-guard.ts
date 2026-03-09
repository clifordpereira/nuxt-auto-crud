import { defineEventHandler, getQuery } from 'h3'
import { useRuntimeConfig } from '#imports'

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
      if (model && isPublicResource(model, config.autoCrud.publicResources)) {
        event.context.nac.isPublic = true
      }
      else {
        throw new AuthenticationError('Unauthorized').toH3()
      }
    }

    return
  }

  // Agentic paths - token auth
  const token = getQuery(event).token as string
  const { agenticToken } = config.autoCrud

  if (!validateToken(token, agenticToken)) {
    throw new AuthenticationError('Invalid agentic token').toH3()
  }
})

function validateToken(token: string, agenticToken: string) {
  // 1. Basic presence and length check
  if (!token || !agenticToken || agenticToken.length < 16) return false
  
  // 2. Exact length match is a prerequisite for timing-safe comparison
  if (token.length !== agenticToken.length) return false

  // 3. Web-standard timing-safe equality (to prevent timing attacks)
  let diff = 0
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ agenticToken.charCodeAt(i)
  }
  return diff === 0
}

function getModelName(pathname: string, nacEndpointPrefix: string) {
  const regex = new RegExp(`^${nacEndpointPrefix}/([^/]+)`)
  const match = pathname.match(regex)
  return match ? match[1] : null
}

function isPublicResource(model: string, publicResources: any = {}) {
  return Object.keys(publicResources).includes(model)
}

function isAgenticPath(pathname: string) {
  return pathname.includes('/_meta')
}

function isNacPath(pathname: string, nacEndpointPrefix: string) {
  return pathname.startsWith(nacEndpointPrefix)
}
