/**
 * Describes a property or column within a database model schema.
 *
 * @public
 */
export interface NacField {
  /**
   * The name identifier of the field.
   */
  name: string

  /**
   * The data type of the field.
   */
  type: string

  /**
   * Indicates if the field is mandatory.
   */
  required?: boolean

  /**
   * Allowed array elements for fields of enum type.
   */
  selectOptions?: string[]

  /**
   * The target model key referenced by this field.
   */
  references?: string

  /**
   * Indicates if this field is read-only in forms.
   */
  readonly?: boolean
}

/**
 * Encapsulates the entire structural layout of a database model schema.
 *
 * @public
 */
export interface NacSchemaDefinition {
  /**
   * The name identifier of the resource.
   */
  resource: string

  /**
   * The field of the model that serves as a primary display label.
   */
  labelField: string

  /**
   * The list of fields defined for this schema.
   */
  fields: NacField[]
}

/**
 * Interface for injecting application-level context into the NAC core.
 *
 * @remarks
 * Facilitates the transfer of actor metadata, permissions, and database record states
 * from the host application to the core query and authorization engine.
 *
 * @public
 */
export interface NacQueryContext {
  /**
   * The ID of the currently authenticated actor.
   */
  userId?: number | string | null

  /**
   * The list of permission flags associated with the authenticated actor.
   */
  resourcePermissions?: string[] | null

  /**
   * Cached record representation to prevent redundant database lookups.
   */
  record?: Record<string, unknown> | null

  /**
   * Indicates if the active routing path allows unauthenticated public access.
   */
  isPublic?: boolean
}

/**
 * Describes the pagination state of a {@link NacPaginatedResponse}.
 *
 * @remarks
 * Intentionally lightweight and flexible to accommodate different
 * pagination strategies — offset, simple, and cursor. Which optional
 * fields are populated depends on `mode`: `page` for `offset`/`simple`,
 * `nextCursor` for `cursor`, and `total` only when explicitly requested
 * by the caller (`?total=true`).
 *
 * @public
 */
export interface NacPaginationMeta {
  /**
   * The pagination strategy used to produce this response.
   */
  mode: 'offset' | 'simple' | 'cursor'

  /**
   * The number of items requested per page.
   */
  perPage: number

  /**
   * The total number of items available. Only present when the caller
   * explicitly opts in (`?total=true`) — computing it requires a
   * separate `COUNT(*)` query.
   */
  total?: number

  /**
   * The current page number. Present in `offset` and `simple` modes.
   */
  page?: number

  /**
   * A cursor value for fetching the next page. Present in `cursor` mode
   * when further results exist.
   */
  nextCursor?: string

  /**
   * Indicates whether more results exist beyond the current page.
   */
  hasMore: boolean
}

/**
 * A paginated response containing data records and pagination metadata.
 *
 * @typeParam T - The type of each data record.
 *
 * @public
 */
export interface NacPaginatedResponse<T> {
  /**
   * The records for the current page.
   */
  data: T[]

  /**
   * Pagination metadata describing how to fetch subsequent pages.
   */
  meta: NacPaginationMeta
}

/**
 * The CRUD operations gated by NAC's authorization layer. Each has a
 * corresponding full-access permission code (e.g. `'update'`) and,
 * except for `'create'`, an own-only variant (e.g. `'update_own'`) — see
 * {@link NacQueryContext.resourcePermissions}.
 *
 * @public
 */
export type NacCrudOperation = 'create' | 'read' | 'update' | 'delete'
