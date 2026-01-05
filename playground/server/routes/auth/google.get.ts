export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user: oauthUser }) {
    return handleOAuthSuccess(event, {
      email: oauthUser.email,
      name: oauthUser.name,
      avatar: oauthUser.picture,
      providerId: oauthUser.sub,
      provider: 'google'
    })
  },
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/login?auth_error=google')
  }
})
