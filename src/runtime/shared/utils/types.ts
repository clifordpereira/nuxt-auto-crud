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

export interface NacPaginationMeta {
  mode: 'offset' | 'simple' | 'cursor'
  perPage: number
  total?: number
  page?: number
  nextCursor?: string
  hasMore: boolean
}

/**
 * Represents metadata for a paginated database response.
 * This interface is intentionally kept lightweight and flexible
 * to accommodate different pagination strategies (offset, simple, cursor).
 *
 * @template T - The type of the data items.
 *
 * @property {"offset" | "simple" | "cursor"} mode - The pagination strategy used.
 * @property {number} perPage - The number of items per page.
 * @property {number} [total] - The total number of items available.
 * @property {number} [page] - The current page number (for simple pagination).
 * @property {string} [nextCursor] - A cursor value for fetching the next page (for cursor pagination).
 * @property {boolean} hasMore - Indicates if there are more pages available.
 */
export interface NacPaginationMeta {
  mode: "offset" | "simple" | "cursor"
  perPage: number
  total?: number
  page?: number
  nextCursor?: string
  hasMore: boolean
}

/**
 * Represents a paginated response containing data records and pagination metadata.
 *
 * @template T - The type of the data records.
 *
 * @property {T[]} data - An array of data records.
 * @property {NacPaginationMeta} meta - Pagination metadata.
 */
export interface NacPaginatedResponse<T> {
  data: T[]
  meta: NacPaginationMeta
}
