import { useRuntimeConfig } from '#imports'
import { NacUnauthorizedAccessError } from '../exceptions'
import type { NacCrudOperation, NacQueryContext } from '../../shared/utils/types'

/* -------------------------------------------------------------------------- */
/*                              AUTHORIZATION                                 */
/* -------------------------------------------------------------------------- */

/**
 * Gate for create/read/update/delete. Throws NacUnauthorizedAccessError
 * unless the caller holds the operation's full-access code (e.g. 'update')
 * or its own-only code (e.g. 'update_own'). A no-op when authorization is
 * disabled or the request is on a public resource.
 *
 * @internal
 */
export function nacRequireOperationPermission(operation: NacCrudOperation, context: NacQueryContext = {}): void {
  const isAuthorizationEnabled = useRuntimeConfig().autoCrud.auth?.authorization
  if (!isAuthorizationEnabled || context.isPublic) return

  const { resourcePermissions = [] } = context
  const hasFull = resourcePermissions?.includes(operation)
  const hasOwn = operation !== 'create' && resourcePermissions?.includes(`${operation}_own`)

  if (!hasFull && !hasOwn) throw new NacUnauthorizedAccessError()
}

/**
 * Checks if the caller has any list permissions.
 *
 * @internal
 */
export function hasAnyListPermissions(context: NacQueryContext = {}) {
  const { resourcePermissions = [] } = context
  return resourcePermissions?.includes('list_all') || resourcePermissions?.includes('list') || resourcePermissions?.includes('list_own')
}
