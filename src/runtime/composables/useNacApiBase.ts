import { useRuntimeConfig } from '#imports'

/**
 * Resolves the active base API routing prefix for the `nuxt-auto-crud` module.
 *
 * It scans the application's public runtime configuration for fallback parameters
 * in priority order (`apiBase` -> `nacEndpointPrefix`), falling back to the
 * default internal path if neither is explicitly defined.
 *
 * @returns The resolved API base URL route string (e.g., '/api/_nac').
 *
 * @example
 * ```ts
 * // Inside a Nuxt component or composable
 * const apiBase = useNacApiBase();
 * const fetchTableData = async (tableName: string) => {
 * return await $fetch(`${apiBase}/${tableName}`);
 * };
 * ```
 */
export function useNacApiBase() {
  const { autoCrud } = useRuntimeConfig().public
  return autoCrud?.apiBase || autoCrud?.nacEndpointPrefix || '/api/_nac'
}
