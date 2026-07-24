export interface NacPaginationOptions {
  limit?: number
  offset?: number
}

export interface NacCursorPaginationOptions {
  cursor: number
  limit: number
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

/**
 * Resolves cursor-based pagination params from raw query params. Returns
 * `null` when no valid `cursor` is present, signalling the caller should
 * fall back to offset-based pagination (`nacResolvePagination`) instead —
 * the two are mutually exclusive per request.
 *
 * Cursor pagination assumes NAC's default `id desc` ordering: "next page"
 * means "rows with id < cursor". This is NOT valid for a resource whose
 * `nacTableQueryConfig` sets a custom, non-id `orderBy` — using `?cursor`
 * there would silently return a page that doesn't match the actual sort.
 * Offset-based pagination has no such restriction.
 */
export function nacResolveCursorPagination(query: Record<string, unknown>): NacCursorPaginationOptions | null {
  if (query.cursor === undefined || query.cursor === null || query.cursor === '') return null

  const cursor = Number(query.cursor)
  if (!Number.isFinite(cursor)) return null

  const rawLimit = Number(query.limit)
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(rawLimit, MAX_LIMIT)
    : DEFAULT_LIMIT

  return { cursor, limit }
}