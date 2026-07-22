import { defineEventHandler, getHeader } from 'h3'

export default defineEventHandler((event) => {
  const testUserId = getHeader(event, 'x-test-user-id')
  if (!testUserId) return // unauthenticated — nac-guard's own defaults apply

  event.context.nac = {
    userId: Number(testUserId),
    isPublic: false,
    resourcePermissions: getHeader(event, 'x-test-permissions')?.split(',') ?? [],
  }
})
