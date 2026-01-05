export const usePermissions = () => {
  const { user } = useUserSession()

  const hasPermission = (resource: string, action: string) => {
    if (!user.value) return false

    // Admin role has all permissions by default in this logic
    if (user.value.role === 'admin') return true

    const permissions = user.value.permissions
    if (!permissions) return false

    const resourcePermissions = permissions[resource]
    if (!resourcePermissions) return false

    // 'list_all' implies 'list'
    if (action === 'list' && resourcePermissions.includes('list_all')) return true

    // 'manage' implies all actions? (Not defined in the schema currently, but good to keep in mind)

    return resourcePermissions.includes(action)
  }

  return {
    hasPermission
  }
}
