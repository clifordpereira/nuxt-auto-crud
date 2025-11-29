export default eventHandler(async (event) => {
  const isAdmin = await checkAdminAccess(event, 'users', 'list')
  if (!isAdmin) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  return [{ id: 1, name: 'Test User' }]
})
