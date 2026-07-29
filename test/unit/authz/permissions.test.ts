import { describe, it, expect, vi } from 'vitest'
import { nacGetPermissionsForUser } from '../../../src/runtime/server/db/queries/sqlite/permissions'
import { users, roles, resources, permissions, roleResourcePermissions } from '../../fixtures/authz/server/db/schema'

type FakeRow = { resourceName: string | null, permissionCode: string | null }

/**
 * Minimal chainable fake mirroring the .select().from().leftJoin()...().where().all()
 * shape nacGetPermissionsForUser calls. We're not verifying Drizzle's generated SQL —
 * that's covered by e2e tests against a real libSQL instance — this isolates the
 * function's own grouping/reduce logic.
 */
function makeFakeDb(rows: FakeRow[]) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    all: vi.fn().mockResolvedValue(rows),
  }
  return chain
}

const schema = { users, roles, resources, permissions, roleResourcePermissions }

describe('nacGetPermissionsForUser', () => {
  it('groups multiple permission codes under their resource name', async () => {
    const db = makeFakeDb([
      { resourceName: 'products', permissionCode: 'list' },
      { resourceName: 'products', permissionCode: 'read' },
      { resourceName: 'orders', permissionCode: 'list_own' },
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await nacGetPermissionsForUser(db as any, schema, 1)

    expect(result).toEqual({
      products: ['list', 'read'],
      orders: ['list_own'],
    })
  })

  it('returns an empty object for a user with no role assigned', async () => {
    // leftJoin(roles, ...) yields nulls all the way down the chain
    const db = makeFakeDb([
      { resourceName: null, permissionCode: null },
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await nacGetPermissionsForUser(db as any, schema, 99)

    expect(result).toEqual({})
  })

  it('returns an empty object for a role with no grants yet', async () => {
    // role exists, but role_resource_permissions has no rows for it
    const db = makeFakeDb([
      { resourceName: null, permissionCode: null },
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await nacGetPermissionsForUser(db as any, schema, 2)

    expect(result).toEqual({})
  })

  it('returns an empty object when the user id matches no rows at all', async () => {
    const db = makeFakeDb([])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await nacGetPermissionsForUser(db as any, schema, 404)

    expect(result).toEqual({})
  })

  it('skips rows where only one of resourceName/permissionCode is present', async () => {
    // shouldn't happen given the join structure, but guards a dangling-reference case
    const db = makeFakeDb([
      { resourceName: 'products', permissionCode: null },
      { resourceName: null, permissionCode: 'read' },
      { resourceName: 'products', permissionCode: 'list' },
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await nacGetPermissionsForUser(db as any, schema, 3)

    expect(result).toEqual({ products: ['list'] })
  })

  it('queries scoped to the given userId', async () => {
    const db = makeFakeDb([])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await nacGetPermissionsForUser(db as any, schema, 7)

    expect(db.from).toHaveBeenCalledWith(users)
    expect(db.leftJoin).toHaveBeenCalledTimes(4)
    expect(db.where).toHaveBeenCalledTimes(1)
  })
})