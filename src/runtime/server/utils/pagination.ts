export interface NacPaginationOptions {
  limit?: number
  offset?: number
}

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200 // cap so a client can't request the whole table in one shot

/**
 * Resolves safe limit/offset values from raw query params.
 * Accepts either `page` + `limit`, or `offset` + `limit` directly.
 */
export function nacResolvePagination(query: Record<string, unknown>): Required<NacPaginationOptions> {
  const rawLimit = Number(query.limit)
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(rawLimit, MAX_LIMIT)
    : DEFAULT_LIMIT

  const rawPage = Number(query.page)
  if (Number.isFinite(rawPage) && rawPage > 0) {
    return { limit, offset: (rawPage - 1) * limit }
  }

  const rawOffset = Number(query.offset)
  const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0

  return { limit, offset }
}
