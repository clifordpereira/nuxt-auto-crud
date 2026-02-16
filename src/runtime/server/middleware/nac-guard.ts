import { defineEventHandler, getQuery } from 'h3'
import { AuthenticationError } from '../exceptions'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const pathname = new URL(event.path, 'http://internal').pathname

  // Non-agentic paths - normal auth
  if (!isAgenticPath(pathname)) {
    const isAuthEnabled = config.autoCrud.auth.authentication
    const isUserAuthenticated = Boolean(event.context.nac?.userId)

    if (isAuthEnabled && !isUserAuthenticated) {
      throw new AuthenticationError().toH3()
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

function isAgenticPath(pathname: string) {
  const agenticPaths = ['/api/_nac/_meta']
  return agenticPaths.includes(pathname)
}
