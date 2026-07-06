import { useRuntimeConfig } from '#imports'

/**
 * Resolves the active base API routing prefix for the `nuxt-auto-crud` module.
 * @returns The resolved API base URL route string (e.g., '/api/_nac').
 */
export function useNacApiBase() {
  const { autoCrud } = useRuntimeConfig().public
  return autoCrud?.apiBase || autoCrud?.nacEndpointPrefix || '/api/_nac'
}
