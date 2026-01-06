// server/api/settings-status.get.ts

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)

  const DEFAULT_ADMIN_EMAIL = 'admin@example.com'
  const DEFAULT_ADMIN_PASSWORD = '$1Password'

  return {
    // Session Password Checks
    hasSessionPassword: !!config.sessionPassword,
    isSessionPasswordValid: config.sessionPassword.length >= 32,

    // Admin Security Checks
    // Returns TRUE if the user has changed the value from the default
    isAdminEmailChanged: config.adminEmail !== DEFAULT_ADMIN_EMAIL,
    isAdminPasswordChanged: config.adminPassword !== DEFAULT_ADMIN_PASSWORD,

    // GitHub OAuth
    hasGithubClientId: !!config.oauth.github.clientId,
    hasGithubClientSecret: !!config.oauth.github.clientSecret,

    // Google OAuth
    hasGoogleClientId: !!config.oauth.google.clientId,
    hasGoogleClientSecret: !!config.oauth.google.clientSecret,

    // Email Config
    hasEmailFrom: !!config.emailFrom,
    hasResendApiKey: !!config.resendApiKey,

    // Analytics (Public Config)
    hasGoogleTagManagerId: !!config.public.scripts.googleTagManager.id,
    hasGoogleAnalyticsId: !!config.public.scripts.googleAnalytics.id,

    // Helper to check if everything is ready for a specific feature
    isOauthFullyConfigured: !!(
      config.oauth.github.clientId && config.oauth.google.clientId
    ),
    isEmailFullyConfigured: !!(config.emailFrom && config.resendApiKey),
  }
})
