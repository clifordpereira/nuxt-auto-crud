export default defineNuxtRouteMiddleware((_to) => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/')
  }
})
