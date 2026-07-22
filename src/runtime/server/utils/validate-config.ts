import { useRuntimeConfig } from '#imports'
import { getColumns } from 'drizzle-orm'

import { nacModelTableMap, nacResolveTableKey } from './modelMapper'
import { nacResolveFieldKey } from './field-resolution'

import type { NacFieldList } from '../../../types'

function validateResourceScopedConfig(configKey: string, value: NacFieldList): void {
  if (Array.isArray(value) || !value.resources) return

  for (const [tableKey, fields] of Object.entries(value.resources)) {
    const canonicalTable = nacResolveTableKey(tableKey)
    if (!canonicalTable) {
      throw new Error(
        `[nuxt-auto-crud] ${configKey}.resources has an unknown table key "${tableKey}". `
        + `Known tables: ${Object.keys(nacModelTableMap).join(', ')}.`,
      )
    }
    const table = nacModelTableMap[canonicalTable]
    if (!table) throw new Error(`[nuxt-auto-crud] Internal error: "${canonicalTable}" not in nacModelTableMap.`)

    const columnKeys = new Set(Object.keys(getColumns(table)))
    for (const field of fields) {
      if (!nacResolveFieldKey(field, columnKeys)) {
        throw new Error(
          `[nuxt-auto-crud] ${configKey}.resources.${tableKey} references unknown field "${field}" `
          + `on "${canonicalTable}". Available: ${[...columnKeys].join(', ')}.`,
        )
      }
    }
  }
}

function validatePublicResources(publicResources: Record<string, string[]> | undefined): void {
  if (!publicResources) return

  for (const [tableKey, fields] of Object.entries(publicResources)) {
    const canonicalTable = nacResolveTableKey(tableKey)
    if (!canonicalTable) {
      throw new Error(`[nuxt-auto-crud] publicResources has an unknown table key "${tableKey}". Known tables: ${Object.keys(nacModelTableMap).join(', ')}.`)
    }
    const table = nacModelTableMap[canonicalTable]
    if (!table) throw new Error(`[nuxt-auto-crud] Internal error: "${canonicalTable}" not in nacModelTableMap.`)

    const columnKeys = new Set(Object.keys(getColumns(table)))
    for (const field of fields) {
      if (!nacResolveFieldKey(field, columnKeys)) {
        throw new Error(`[nuxt-auto-crud] publicResources.${tableKey} references unknown field "${field}" on "${canonicalTable}". Available: ${[...columnKeys].join(', ')}.`)
      }
    }
  }
}

/**
 * Validates every per-resource field-list override at server boot.
 *
 * Validation only — this does NOT rewrite the runtime config. Nitro's
 * runtime config can be frozen once the server is built/serving requests
 * (confirmed directly: in-place normalization threw "Cannot delete
 * property... of #<Object>" against a real built server), so casing
 * resolution happens live, per lookup, in getSelectableFields /
 * resolveFieldList / nacGetTableQueryConfig instead. This function's only
 * job is to fail loudly, at boot, on typos that resolve under neither
 * casing.
 * @public
 */
export function nacValidateFieldConfig(): void {
  const { autoCrud, public: { autoCrud: publicAutoCrud } } = useRuntimeConfig()
  validateResourceScopedConfig('apiHiddenFields', autoCrud.apiHiddenFields)
  validateResourceScopedConfig('apiWriteProtectedFields', autoCrud.apiWriteProtectedFields)
  validateResourceScopedConfig('formHiddenFields', publicAutoCrud.formHiddenFields)
  validatePublicResources(autoCrud.publicResources)
}
