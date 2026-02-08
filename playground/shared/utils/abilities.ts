import type { User } from '#auth-utils'

export function isAdmin(user: User | null | undefined) {
  if (!user) return false;
  return user?.role === 'admin'
}

export function isOwner(user: User | null | undefined, record?: Record<string, any>, ownerKey: string = 'createdBy'): boolean {
  if (!user?.id || !record) return false;
  return Number(user.id) === Number(record[ownerKey]);
}

export function hasPermission(user: User | null | undefined, model: string, action: string) {
  if (isAdmin(user)) return true;
  if (!user) return false;
  return !!user?.permissions?.[model]?.includes(action)
}

export function hasRowPermission(user: User | null | undefined, model: string, action: string, record?: any) {
  if (!user) return false;

  if (hasPermission(user, model, action)) return true;

  if (hasPermission(user, model, `${action}_own`)) {
    return isOwner(user, record);
  }

  return false;
}
