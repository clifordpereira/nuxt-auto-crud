import { defineAbility } from 'nuxt-authorization/utils'

export default defineAbility((user, { can }) => {
  if (user?.role === 'admin') {
    can('manage', 'all')
  }
  else {
    // Public permissions
    can('list', 'products')
    can('read', 'products')
  }
  return true
})
