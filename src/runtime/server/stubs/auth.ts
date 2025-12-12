export const requireUserSession = () => { throw new Error('nuxt-auth-utils not installed') }
export const getUserSession = () => Promise.resolve({ user: null })
export const allows = () => Promise.resolve(true)
export const abilities = null
export const abilityLogic = null
