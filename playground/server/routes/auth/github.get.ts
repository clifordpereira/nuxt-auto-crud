export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
  },
  async onSuccess(event, { user: oauthUser }) {
    return handleOAuthSuccess(event, {
      email: oauthUser.email,
      name: oauthUser.name || (oauthUser as { login: string }).login,
      avatar: (oauthUser as { avatar_url: string }).avatar_url,
      providerId: String(oauthUser.id),
      provider: 'github',
    })
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/login?auth_error=github')
  },
})
