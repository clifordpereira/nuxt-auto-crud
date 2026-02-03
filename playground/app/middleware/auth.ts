export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  if (to.path.startsWith('/api/_nac/') && !loggedIn.value) {
    return navigateTo('/')
  }

  if (!loggedIn.value) {
    return navigateTo('/')
  }
})
