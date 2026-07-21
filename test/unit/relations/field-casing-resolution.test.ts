import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRuntimeConfig } from '#imports'
import { nacValidateFieldConfig } from '../../../src/runtime/server/utils/validate-config'
import { nacGetTableQueryConfig } from '../../../src/runtime/server/utils/db'
import type { NacFieldList } from '../../../src/types'

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

  it('resolves a camelCase guess to the real snake_case key, proving bidirectional resolution', () => {
    const config = buildConfig({
      apiWriteProtectedFields: { resources: { order_items: ['orderId', 'productId'] } },
    })
    vi.mocked(useRuntimeConfig).mockReturnValue(config as never)

    expect(() => nacValidateFieldConfig()).not.toThrow()
    expect(config.autoCrud.apiWriteProtectedFields).toEqual({
      resources: { order_items: ['order_id', 'product_id'] },
    })
  })

  it('handles mixed casing guesses across fields on the same table without crashing', () => {
    const config = buildConfig({
      apiHiddenFields: { resources: { order_items: ['order_id', 'productId'] } },
    })
    vi.mocked(useRuntimeConfig).mockReturnValue(config as never)

    expect(() => nacValidateFieldConfig()).not.toThrow()
    expect(config.autoCrud.apiHiddenFields).toEqual({
      resources: { order_items: ['order_id', 'product_id'] },
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