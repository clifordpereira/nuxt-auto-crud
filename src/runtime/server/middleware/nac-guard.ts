import { defineEventHandler, getQuery } from 'h3'
import { UnauthorizedAccessError } from '../exceptions'

/**
 * Guard Agentic path with Agentic token
 */
export default defineEventHandler(async (event) => {
  const pathname = new URL(event.path, 'http://internal').pathname
  if (!isAgenticPath(pathname)) return

  const token = getQuery(event).token as string
  if (hasValidToken(token)) return

  // If reached here, token is invalid
  throw new UnauthorizedAccessError('NAC Core: Unauthorized access - Invalid API Token')
})

/**
 * Helper functions
 */
function isAgenticPath(pathname: string) {
  const agenticPaths = ['/api/_nac/_meta']
  return agenticPaths.includes(pathname)
}

function hasValidToken(token: string) {
  const nacAgenticToken = useRuntimeConfig().autoCrud.nacAgenticToken
  return (nacAgenticToken && token === nacAgenticToken)
}
