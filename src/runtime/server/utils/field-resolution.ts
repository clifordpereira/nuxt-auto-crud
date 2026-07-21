import type { NacFieldList } from '../types'

/** @internal */
export function nacToCamelCase(input: string): string {
  return input.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())
}

/**
 * Only ever applied to a string already known to be correct (e.g. a
 * resolved schema export key) — never used to guess an unknown target.
 * @internal
 */
export function nacToSnakeCase(input: string): string {
  return input.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
}

/**
 * Resolves a user-supplied field name (snake_case or camelCase) to the
 * real JS property key present in a table's columns. Checks the input
 * and its camelCase reconstruction against the real column set — never
 * blindly trusts the transform.
 * @internal
 */
export function nacResolveFieldKey(input: string, columnKeys: ReadonlySet<string>): string | undefined {
  if (columnKeys.has(input)) return input
  const camel = nacToCamelCase(input)
  if (columnKeys.has(camel)) return camel
  const snake = nacToSnakeCase(input)
  if (columnKeys.has(snake)) return snake
  return undefined
}

/**
 * Resolves a NacFieldList config (flat or per-resource) into a concrete
 * Set for a specific resource.
 */
export function resolveFieldList(
  config: NacFieldList,
  resourceName: string,
  builtInDefault: string[],
): Set<string> {
  if (Array.isArray(config)) return new Set(config)

  const base = config.default ?? builtInDefault
  const extra = config.resources?.[resourceName] ?? []
  return new Set([...base, ...extra])
}
