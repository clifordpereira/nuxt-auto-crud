import { defineEventHandler, getQuery } from 'h3'
import { useRuntimeConfig } from '#imports'

import { NacAuthenticationError } from '../exceptions'

export default defineEventHandler(async (event) => {
  const pathname = new URL(event.path, 'http://internal').pathname
  const config = useRuntimeConfig(event)
  const { apiBase, nacEndpointPrefix } = config.public.autoCrud
  const prefix = apiBase || nacEndpointPrefix || '/api/_nac'

  if (!isNacPath(pathname, prefix)) return

  event.context.nac ||= { userId: null, isPublic: false }

  if (!isAgenticPath(pathname)) {
    const isAuthEnabled = config.autoCrud.auth?.authentication
    const isUserAuthenticated = Boolean(event.context.nac?.userId)

    if (isAuthEnabled && !isUserAuthenticated) {
      const model = nacGetModelFromPath(pathname, prefix)
      if (model && isPublicResource(model, config.autoCrud.publicResources)) {
        event.context.nac.isPublic = true
      }
      else {
        throw new NacAuthenticationError('Unauthorized').toH3()
      }
    }
    return
  }

  const token = getQuery(event).token as string
  const { agenticToken } = config.autoCrud
  if (!validateToken(token, agenticToken)) {
    throw new NacAuthenticationError('Invalid agentic token').toH3()
  }
})

function validateToken(token: string, agenticToken: string) {
  if (!token || !agenticToken || agenticToken.length < 16) return false
  if (token.length !== agenticToken.length) return false
  let diff = 0
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ agenticToken.charCodeAt(i)
  return diff === 0
}

/**
 * Extracts the `:model` segment from a NAC route pathname (e.g.
 * `/api/_nac/products/5` → `'products'`). Exported so consuming apps'
 * own middleware can determine which resource a request targets without
 * re-implementing this parsing themselves — see the README's
 * "Authorization Middleware" example.
 *
 * @public
 */
export function nacGetModelFromPath(pathname: string, prefix?: string) {
  const resolvedPrefix = prefix ?? (() => {
    const { apiBase, nacEndpointPrefix } = useRuntimeConfig().public.autoCrud
    return apiBase || nacEndpointPrefix || '/api/_nac'
  })()
  const regex = new RegExp(`^${resolvedPrefix}/([^/]+)`)
  const match = pathname.match(regex)
  return match ? match[1] : null
}

function isPublicResource(model: string, publicResources: Record<string, string[]> = {}) {
  return Object.keys(publicResources).includes(model)
}

function isAgenticPath(pathname: string) {
  return pathname.includes('/_nac/_meta')
}

function isNacPath(pathname: string, prefix: string) {
  return pathname.startsWith(prefix)
}
