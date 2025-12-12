import { defineAbility } from 'nuxt-authorization/utils'

export const abilities = defineAbility({ allowGuest: true }, (_user: unknown, _to: unknown, _action: unknown) => {
  return true
})

export const abilityLogic = null
