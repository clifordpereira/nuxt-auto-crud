import { createError, type H3Error } from '#imports'

/**
 * Base exception class representing an Auto CRUD operations failure.
 *
 * @public
 */
export class NacAutoCrudError extends Error {
  /**
   * The HTTP status code associated with this error.
   */
  public readonly statusCode: number

  constructor(message: string, statusCode: number = 500) {
    super(message)

    this.statusCode = statusCode
    this.name = new.target.name

    // Fix prototype chain
    Object.setPrototypeOf(this, new.target.prototype)
  }

  /**
   * Converts the internal exception into an H3-compatible HTTP error.
   *
   * @returns An H3Error response.
   * @public
   */
  toH3(): H3Error {
    return createError({
      statusCode: this.statusCode,
      statusMessage: this.message,
      data: {
        code: this.name,
        message: this.message,
      },
    })
  }
}

/* -------------------------------------------------------------------------- */
/*                               AUTH ERRORS                                  */
/* -------------------------------------------------------------------------- */

/**
 * Thrown when an operations request fails authentication.
 *
 * @public
 */
export class NacAuthenticationError extends NacAutoCrudError {
  constructor(message: string = 'Authentication required') {
    super(message, 401)
  }
}

/**
 * Thrown when an authenticated client lacks authorization permissions for a resource.
 *
 * @public
 */
export class NacUnauthorizedAccessError extends NacAutoCrudError {
  constructor(message: string = 'Forbidden') {
    super(message, 403)
  }
}

/* -------------------------------------------------------------------------- */
/*                             VALIDATION ERRORS                              */
/* -------------------------------------------------------------------------- */

/**
 * Thrown when payload schema validation fails.
 *
 * @public
 */
export class NacValidationError extends NacAutoCrudError {
  constructor(modelName: string, message?: string) {
    super(message ?? `${modelName} validation failed`, 400)
  }
}

/**
 * Thrown when the target model slug or identifier is missing.
 *
 * @public
 */
export class NacMissingSlugError extends NacAutoCrudError {
  constructor(message: string = 'Missing slug or ID') {
    super(message, 400)
  }
}

/* -------------------------------------------------------------------------- */
/*                            RESOURCE / MODEL ERRORS                         */
/* -------------------------------------------------------------------------- */

/**
 * Thrown when the requested database table/model cannot be resolved.
 *
 * @public
 */
export class NacResourceNotFoundError extends NacAutoCrudError {
  constructor(modelName: string) {
    super(`Resource ${modelName} not found`, 404)
  }
}

/* -------------------------------------------------------------------------- */
/*                                CRUD ERRORS                                 */
/* -------------------------------------------------------------------------- */

/**
 * Thrown when a specific database row or record cannot be found.
 *
 * @public
 */
export class NacRecordNotFoundError extends NacAutoCrudError {
  constructor(message: string = 'Record not found') {
    super(message, 404)
  }
}

/**
 * Thrown when trying to insert a database record that already exists.
 *
 * @public
 */
export class NacRecordAlreadyExistsError extends NacAutoCrudError {
  constructor(message: string = 'Record already exists') {
    super(message, 409)
  }
}

/**
 * Thrown when database row insertion fails.
 *
 * @public
 */
export class NacInsertionFailedError extends NacAutoCrudError {
  constructor(message: string = 'Record insertion failed') {
    super(message, 500)
  }
}

/**
 * Thrown when database row modification/update fails.
 *
 * @public
 */
export class NacUpdateFailedError extends NacAutoCrudError {
  constructor(message: string = 'Record update failed') {
    super(message, 500)
  }
}

/**
 * Thrown when database row removal/deletion fails.
 *
 * @public
 */
export class NacDeletionFailedError extends NacAutoCrudError {
  constructor(message: string = 'Record deletion failed') {
    super(message, 500)
  }
}
