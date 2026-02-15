import { createError } from 'h3'

export class AutoCrudError extends Error {
  constructor(message: string, statusCode: number) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)

    return createError({
      statusCode,
      statusMessage: message,
    })
  }
}

export class ValidationError extends AutoCrudError {
  constructor(modelName: string, message: string = `${modelName} validation failed`) {
    super(message, 400)
  }
}
export class UnauthorizedAccessError extends AutoCrudError {
  constructor(modelName: string, message: string = `${modelName} access denied`) {
    super(message, 401)
  }
}

export class MissingSlugError extends AutoCrudError {
  constructor(message: string = 'Missing slug/id') {
    super(message, 400)
  }
}

export class ResourceNotFoundError extends AutoCrudError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
  }
}

// CRUD errors
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

export class UpdationFailedError extends AutoCrudError {
  constructor(message: string = 'Record updation failed') {
    super(message, 500)
  }
}

export class DeletionFailedError extends AutoCrudError {
  constructor(message: string = 'Record deletion failed') {
    super(message, 500)
  }
}

export class InsertionFailedError extends AutoCrudError {
  constructor(message: string = 'Record insertion failed') {
    super(message, 500)
  }
}
