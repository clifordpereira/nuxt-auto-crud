export const requireUserSession = () => {
  throw new Error('nuxt-auth-utils not installed')
}
export const getUserSession = () => Promise.resolve({ user: null })
export const hashPassword = (password: string) => {
  console.warn('nuxt-auth-utils not installed. Password not hashed!')
  return Promise.resolve(password)
}
export const allows = () => Promise.resolve(true)
export const abilities = null
export const abilityLogic = null
