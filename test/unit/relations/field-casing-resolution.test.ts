import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRuntimeConfig } from '#imports'
import { nacValidateFieldConfig } from '../../../src/runtime/server/utils/validate-config'
import { nacGetTableQueryConfig } from '../../../src/runtime/server/utils/db'
import type { NacFieldList } from '../../../src/types'
import { nacResolveFieldKey } from '../../../src/runtime/server/utils/field-resolution'

interface TestConfig {
  autoCrud: {
    apiHiddenFields: NacFieldList
    apiWriteProtectedFields: NacFieldList
    publicResources: Record<string, string[]>
  }
  public: { autoCrud: { formHiddenFields: NacFieldList } }
}

function buildConfig(overrides: Partial<TestConfig['autoCrud']> = {}): TestConfig {
  return {
    autoCrud: { apiHiddenFields: [], apiWriteProtectedFields: [], publicResources: {}, ...overrides },
    public: { autoCrud: { formHiddenFields: [] } },
  }
}

describe('nacValidateFieldConfig — order_items has snake_case-only JS keys (no camelCase form exists)', () => {
  beforeEach(() => vi.mocked(useRuntimeConfig).mockReset())

  it('accepts field names written exactly as declared in the schema (snake_case)', () => {
    const config = buildConfig({
      apiWriteProtectedFields: { resources: { order_items: ['order_id', 'product_id'] } },
    })
    vi.mocked(useRuntimeConfig).mockReturnValue(config as never)

    expect(() => nacValidateFieldConfig()).not.toThrow()
    expect(config.autoCrud.apiWriteProtectedFields).toEqual({
      resources: { order_items: ['order_id', 'product_id'] },
    })
  })

  it('resolves a camelCase guess to the real snake_case column at lookup time (not at validation time)', () => {
    const config = buildConfig({
      apiWriteProtectedFields: { resources: { order_items: ['orderId'] } },
    })
    vi.mocked(useRuntimeConfig).mockReturnValue(config as never)
    expect(() => nacValidateFieldConfig()).not.toThrow()

    // This is the thing that actually matters: does the guess resolve to a
    // real column, even though nacValidateFieldConfig left it unchanged?
    const columnKeys = new Set(['id', 'order_id', 'product_id', 'quantity', 'price'])
    expect(nacResolveFieldKey('orderId', columnKeys)).toBe('order_id')
  })

  it('does not throw on a camelCase guess, which resolves live at lookup time rather than at validation time', () => {
    const config = buildConfig({
      apiWriteProtectedFields: { resources: { order_items: ['orderId', 'productId'] } },
    })
    vi.mocked(useRuntimeConfig).mockReturnValue(config as never)

    // Casing resolution now happens live in resolveFieldList/getSelectableFields at request
    // time, so the config here is expected to remain exactly as authored.
    expect(() => nacValidateFieldConfig()).not.toThrow()
    expect(config.autoCrud.apiWriteProtectedFields).toEqual({
      resources: { order_items: ['orderId', 'productId'] },
    })
  })

  it('handles mixed casing guesses across fields on the same table without crashing', () => {
    const config = buildConfig({
      apiHiddenFields: { resources: { order_items: ['order_id', 'productId'] } },
    })
    vi.mocked(useRuntimeConfig).mockReturnValue(config as never)

    expect(() => nacValidateFieldConfig()).not.toThrow()
    expect(config.autoCrud.apiHiddenFields).toEqual({
      resources: { order_items: ['order_id', 'productId'] }, // ← 'productId', not 'product_id' — config is left as-authored, unresolved
    })
  })

  it('throws loudly on a table key typo (missing trailing "s")', () => {
    const config = buildConfig({
      apiWriteProtectedFields: { resources: { order_item: ['order_id'] } },
    })
    vi.mocked(useRuntimeConfig).mockReturnValue(config as never)

    expect(() => nacValidateFieldConfig()).toThrow(/unknown table key "order_item"/)
  })

  it('throws loudly on a field name that matches neither the literal key nor either casing transform', () => {
    const config = buildConfig({
      apiWriteProtectedFields: { resources: { order_items: ['ordr_id'] } },
    })
    vi.mocked(useRuntimeConfig).mockReturnValue(config as never)

    expect(() => nacValidateFieldConfig()).toThrow(/unknown field "ordr_id"/)
  })
})

describe('nacGetTableQueryConfig — order_items', () => {
  it('resolves when nacTableQueryConfig is keyed by the literal snake_case name (current relations.ts)', () => {
    expect(nacGetTableQueryConfig('order_items')).toBeTruthy()
  })
})
