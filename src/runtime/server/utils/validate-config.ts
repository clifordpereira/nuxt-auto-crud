import { getColumns } from 'drizzle-orm'

import { useRuntimeConfig } from '#imports'

import type { NacFieldList } from '../types'

import { nacModelTableMap, nacResolveTableKey } from './modelMapper'
import { nacResolveFieldKey } from './field-resolution'


function normalizeResourceScopedConfig(configKey: string, value: NacFieldList): void {
  if (Array.isArray(value) || !value.resources) return

  const original = value.resources
  const normalized: Record<string, string[]> = {}

  for (const [tableKey, fields] of Object.entries(original)) {
    const canonicalTable = nacResolveTableKey(tableKey)
    if (!canonicalTable) {
      throw new Error(
        `[nuxt-auto-crud] ${configKey}.resources has an unknown table key "${tableKey}". `
        + `Expected a physical table name (e.g. "role_resource_permissions") or its camelCase `
        + `schema export name (e.g. "roleResourcePermissions"). `
        + `Known tables: ${Object.keys(nacModelTableMap).join(', ')}.`,
      )
    }

    const table = nacModelTableMap[canonicalTable]
    if (!table) {
      throw new Error(`[nuxt-auto-crud] Internal error: resolved table key "${canonicalTable}" not found in nacModelTableMap.`)
    }

    const columnKeys = new Set(Object.keys(getColumns(table)))

    normalized[canonicalTable] = fields.map((field) => {
      const resolved = nacResolveFieldKey(field, columnKeys)
      if (!resolved) {
        throw new Error(
          `[nuxt-auto-crud] ${configKey}.resources.${tableKey} references unknown field "${field}" `
          + `on table "${canonicalTable}". Available fields: ${[...columnKeys].join(', ')}. `
          + `Check for a typo, or a snake_case/camelCase mix-up.`,
        )
      }
      return resolved
    })
  }

  value.resources = normalized
}

function normalizePublicResources(publicResources: Record<string, string[]> | undefined): void {
  if (!publicResources) return

  const original = { ...publicResources }
  for (const key in publicResources) delete publicResources[key]

  for (const [tableKey, fields] of Object.entries(original)) {
    const canonicalTable = nacResolveTableKey(tableKey)
    if (!canonicalTable) {
      throw new Error(
        `[nuxt-auto-crud] publicResources has an unknown table key "${tableKey}". `
        + `Known tables: ${Object.keys(nacModelTableMap).join(', ')}.`,
      )
    }

    const table = nacModelTableMap[canonicalTable]
    if (!table) {
      throw new Error(`[nuxt-auto-crud] Internal error: resolved table key "${canonicalTable}" not found in nacModelTableMap.`)
    }

    const columnKeys = new Set(Object.keys(getColumns(table)))

    publicResources[canonicalTable] = fields.map((field) => {
      const resolved = nacResolveFieldKey(field, columnKeys)
      if (!resolved) {
        throw new Error(
          `[nuxt-auto-crud] publicResources.${tableKey} references unknown field "${field}" `
          + `on table "${canonicalTable}". Available fields: ${[...columnKeys].join(', ')}.`,
        )
      }
      return resolved
    })
  }
}

/**
 * Validates and normalizes every per-resource field-list override —
 * `apiHiddenFields`, `apiWriteProtectedFields`, `formHiddenFields`, and
 * `publicResources` — once, at server boot.
 *
 * Table keys may be the physical snake_case table name or the camelCase
 * schema export name; field names may be snake_case or camelCase. Both
 * are resolved against the real schema and rewritten to canonical form in
 * place, so every request-time lookup afterwards is a plain, cheap
 * membership check — no per-request resolution cost.
 *
 * Global/default field-list entries (outside `resources`) are NOT checked
 * here, since they intentionally apply across tables that may not all
 * share every field (e.g. `password` doesn't exist on every resource).
 *
 * @throws Error naming the exact config path, the offending key, and the
 * valid options, for anything that resolves under neither casing.
 * @public
 */
export function nacValidateFieldConfig(): void {
  const { autoCrud, public: { autoCrud: publicAutoCrud } } = useRuntimeConfig()

  normalizeResourceScopedConfig('apiHiddenFields', autoCrud.apiHiddenFields)
  normalizeResourceScopedConfig('apiWriteProtectedFields', autoCrud.apiWriteProtectedFields)
  normalizeResourceScopedConfig('formHiddenFields', publicAutoCrud.formHiddenFields)
  normalizePublicResources(autoCrud.publicResources)
}