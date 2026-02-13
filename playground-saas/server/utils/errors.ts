export class ApiError extends Error {
  statusCode: number
  statusMessage: string

  constructor(message: string, statusCode: number, statusMessage: string = 'API Error') {
    super(message)
    this.statusCode = statusCode
    this.statusMessage = statusMessage
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
    this.name = this.constructor.name
  }
}

export class InvalidCredentialError extends ApiError {
  constructor(message: string = 'Invalid credentials') {
    super(message, 401, 'Unauthorized')
  }
}

export class UserNotFoundError extends ApiError {
  constructor(message: string = 'User not found') {
    super(message, 404, 'Not Found')
  }
}

export class UserAlreadyExistsError extends ApiError {
  constructor(message: string = 'User already exists') {
    super(message, 409, 'Conflict')
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'You do not have permission to access this resource') {
    super(message, 403, 'Forbidden')
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad Request') {
    super(message, 400, 'Bad Request')
  }
}
