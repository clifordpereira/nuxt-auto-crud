import { createError } from 'h3'

export class AutoCrudError extends Error {
  statusCode: number
  statusMessage?: string

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.statusMessage = message
  }

  toH3Error() {
    return createError({
      statusCode: this.statusCode,
      message: this.message,
    })
  }
}

export class RecordNotFoundError extends AutoCrudError {
  constructor(message: string = 'Record not found') {
    super(message, 404)
  }
}

export class ResourceNotFoundError extends AutoCrudError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
  }
}

export class ValidationError extends AutoCrudError {
  constructor(modelName: string, message: string = `${modelName} validation failed`) {
    super(message, 400)
  }
}
