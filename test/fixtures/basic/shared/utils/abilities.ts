import { defineAbility } from 'nuxt-authorization/utils'

export const abilityLogic = (user: any, model: string, action: string) => {
  return true
}

export default defineAbility(abilityLogic)
