import { eventHandler, createError } from 'h3'
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
        // @ts-expect-error - requireUserSession is auto-imported
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
