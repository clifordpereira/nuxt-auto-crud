// composables/useAuthErrorHandling.ts
export const useAuthErrorHandling = () => {
  const toast = useToast()
  const route = useRoute()

  const handleAuthQueryError = () => {
    watch(
      () => route.query.auth_error,
      async (authError) => {
        if (authError) {
          const errorMessages: Record<string, string> = {
            github: 'Failed to login with GitHub.',
            google: 'Failed to login with Google.',
            no_email: 'Your social account did not provide an email address.',
            user_creation_failed: 'Failed to create a user account.',
          }

          toast.add({
            title: 'Authentication Error',
            description:
              errorMessages[authError as string]
              || 'An unknown error occurred during authentication.',
            color: 'error',
          })

          // Clean up query params
          const query = { ...route.query }
          delete query.auth_error
          await navigateTo({ path: route.path, query }, { replace: true })
        }
      },
      { immediate: true },
    )
  }

  const handleSubmitError = (error: unknown, defaultMessage: string) => {
    const message
      = (error as { data?: { message?: string } })?.data?.message
        || defaultMessage
    toast.add({ title: 'Error', description: message, color: 'error' })
  }

  return {
    handleAuthQueryError,
    handleSubmitError,
  }
}
