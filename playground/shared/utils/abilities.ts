import type { User } from '#auth-utils'

export const listRecords = defineAbility((user: User, model: string) => {
  return hasPermission(user, model, 'list') || hasPermission(user, model, 'list_all') || hasPermission(user, model, 'list_own')
})

export const readRecord = defineAbility((user: User, model: string) => {
  return hasPermission(user, model, 'read') || hasPermission(user, model, 'read_own')
})

export const createRecord = defineAbility((user: User, model: string) => {
  return hasPermission(user, model, 'create')
})

export const updateRecord = defineAbility((user: User, model: string) => {
  return hasPermission(user, model, 'update') || hasPermission(user, model, 'update_own')
})

export const deleteRecord = defineAbility((user: User, model: string) => {
  return hasPermission(user, model, 'delete') || hasPermission(user, model, 'delete_own')
})


export const updateOwnRecord = defineAbility((user: User, model: any) => {
  // If user has full update permission, they can update anything
  if (hasPermission(user, model?.resourceName || model?.collection, 'update')) return true

  // If user only has update_own, check ownership
  if (hasPermission(user, model?.resourceName || model?.collection, 'update_own')) {
    return user.id === model.authorId || user.id === model.userId || user.id === model.createdBy
  }
  
  return false
})

export const deleteOwnRecord = defineAbility((user: User, model: any) => {
  // If user has full delete permission, they can delete anything
  if (hasPermission(user, model?.resourceName || model?.collection, 'delete')) return true

  // If user only has delete_own, check ownership
  if (hasPermission(user, model?.resourceName || model?.collection, 'delete_own')) {
    return user.id === model.authorId || user.id === model.userId || user.id === model.createdBy
  }

  return false
})


function hasPermission(user: any, model: string, action: string) {
  if (user?.role === 'admin') return true
  if (!user?.permissions || !user.permissions[model]) return false
  return user.permissions[model].includes(action)
}
