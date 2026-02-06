// server/api/_health.get.ts
import { defineEventHandler } from 'h3'

interface HealthReport {
  status: 'ok' | 'needs_config'
  timestamp: string
  // Use a partial of your settings-status logic
  ready: {
    auth: boolean
    email: boolean
    storage: boolean
  }
}

export default defineEventHandler((event): HealthReport => {
  const config = useRuntimeConfig(event)

  const isAuthReady = !!(config.oauth.github.clientId && config.oauth.google.clientId)
  const isEmailReady = !!(config.emailFrom && config.resendApiKey)

  return {
    status: (isAuthReady && isEmailReady) ? 'ok' : 'needs_config',
    timestamp: new Date().toISOString(),
    ready: {
      auth: isAuthReady,
      email: isEmailReady,
      storage: true, // Add Drizzle ping here later
    },
  }
})
