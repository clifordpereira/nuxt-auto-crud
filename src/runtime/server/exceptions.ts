import { createError } from 'h3'

export class AutoCrudError extends Error {
  public statusCode: number

  constructor(message: string, statusCode: number = 500) {
    // Pass message to native Error
    super(message) 
    this.statusCode = statusCode
    
    // Set class name for stack traces/logs
    this.name = this.constructor.name
    
    // Maintain prototype chain (Crucial for instanceof)
    Object.setPrototypeOf(this, new.target.prototype)
  }

  toH3() {
    return createError({
      statusCode: this.statusCode,
      statusMessage: this.message,
      data: { code: this.name }
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
  constructor(modelName: string) {
    super(`Resource ${modelName} not found`, 404)
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
