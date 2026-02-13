import { refreshUserSession } from '#server/utils/auth'

export default eventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user || !(session.user as { id: number }).id) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  const userId = (session.user as { id: number }).id

  // Use shared logic to fetch fresh data and set session
  const fullUser = await refreshUserSession(event, userId)

  return { user: fullUser }
})
