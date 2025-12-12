import { defineAbility } from 'nuxt-authorization/utils'

export const abilities = defineAbility({ allowGuest: true }, (user: any, to: any, action: any) => {
  return true
})

export const abilityLogic = null
