import { eventHandler, createError, getRouterParam } from 'h3'
import { getSchema } from '../../utils/schema'
import { useAutoCrudConfig } from '../../utils/config'
import { verifyJwtToken } from '../../utils/jwt'

export default eventHandler(async (event) => {
  const { auth } = useAutoCrudConfig()
  const tableName = getRouterParam(event, 'table')

  if (auth?.authentication) {
      let isAuthenticated = false
      if (auth.type === 'jwt' && auth.jwtSecret) {
          isAuthenticated = await verifyJwtToken(event, auth.jwtSecret)
      } else {
          try {
              // @ts-expect-error - requireUserSession is auto-imported
              await requireUserSession(event)
              isAuthenticated = true
          } catch (e) {
              isAuthenticated = false
          }
      }

      if (!isAuthenticated) {
          throw createError({ statusCode: 401, message: 'Unauthorized' })
      }
  }

  if (!tableName) {
      throw createError({ statusCode: 400, message: 'Table name is required' })
  }

  const schema = await getSchema(tableName)
  if (!schema) {
      throw createError({ statusCode: 404, message: `Table '${tableName}' not found` })
  }

  return schema
})
