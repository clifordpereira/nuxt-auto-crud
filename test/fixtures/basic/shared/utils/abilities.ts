import { defineAbility } from 'nuxt-authorization/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export const abilityLogic = (_user: any, _model: string, _action: string) => {
  return true
}

export default defineAbility(abilityLogic)
