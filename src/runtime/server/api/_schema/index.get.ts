import { eventHandler, createError } from 'h3'
// @ts-expect-error - #imports is available in runtime
import { requireUserSession } from '#imports'
import { getAllSchemas } from '../../utils/schema'
import { useAutoCrudConfig } from '../../utils/config'
import { verifyJwtToken } from '../../utils/jwt'

export default eventHandler(async (event) => {
  const { auth } = useAutoCrudConfig()

  if (auth?.authentication) {
    let isAuthenticated = false
    if (auth.type === 'jwt' && auth.jwtSecret) {
      isAuthenticated = await verifyJwtToken(event, auth.jwtSecret)
    }
    else {
      try {
        await requireUserSession(event)
        isAuthenticated = true
      }
      catch {
        isAuthenticated = false
      }
    }

    if (!isAuthenticated) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
  }

  return getAllSchemas()
})
