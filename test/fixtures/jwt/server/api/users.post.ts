export default eventHandler(async (event) => {
  const isAdmin = await checkAdminAccess(event, 'users', 'create')
  if (!isAdmin) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  const body = await readBody(event)
  return body
})
