// utils/helpers.ts
export function crudHeaders() {
  // Proxies cookies during SSR to maintain session
  return useRequestHeaders(['cookie'])
  // Authorization: `Bearer ${token}`
}
