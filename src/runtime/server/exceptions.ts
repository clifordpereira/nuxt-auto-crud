import { createError } from '#imports'

/**
 * Base Auto CRUD Error
 */
export class AutoCrudError extends Error {
  public readonly statusCode: number

  constructor(message: string, statusCode: number = 500) {
    super(message)

    this.statusCode = statusCode
    this.name = new.target.name

    // Fix prototype chain
    Object.setPrototypeOf(this, new.target.prototype)
  }

  /**
   * Convert to Nuxt/H3 compatible error
   */
  toH3() {
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

export class AuthenticationError extends AutoCrudError {
  constructor(message: string = 'Authentication required') {
    super(message, 401)
  }
}

export class UnauthorizedAccessError extends AutoCrudError {
  constructor(message: string = 'Forbidden') {
    super(message, 403)
  }
}

/* -------------------------------------------------------------------------- */
/*                             VALIDATION ERRORS                              */
/* -------------------------------------------------------------------------- */

export class ValidationError extends AutoCrudError {
  constructor(modelName: string, message?: string) {
    super(message ?? `${modelName} validation failed`, 400)
  }
}

export class MissingSlugError extends AutoCrudError {
  constructor(message: string = 'Missing slug or ID') {
    super(message, 400)
  }
}

/* -------------------------------------------------------------------------- */
/*                            RESOURCE / MODEL ERRORS                         */
/* -------------------------------------------------------------------------- */

export class ResourceNotFoundError extends AutoCrudError {
  constructor(modelName: string) {
    super(`Resource ${modelName} not found`, 404)
  }
}

/* -------------------------------------------------------------------------- */
/*                                CRUD ERRORS                                 */
/* -------------------------------------------------------------------------- */

export class RecordNotFoundError extends AutoCrudError {
  constructor(message: string = 'Record not found') {
    super(message, 404)
  }
}

export class RecordAlreadyExistsError extends AutoCrudError {
  constructor(message: string = 'Record already exists') {
    super(message, 409)
  }
}

export class InsertionFailedError extends AutoCrudError {
  constructor(message: string = 'Record insertion failed') {
    super(message, 500)
  }
}

export class UpdateFailedError extends AutoCrudError {
  constructor(message: string = 'Record update failed') {
    super(message, 500)
  }
}

export class DeletionFailedError extends AutoCrudError {
  constructor(message: string = 'Record deletion failed') {
    super(message, 500)
  }
}
