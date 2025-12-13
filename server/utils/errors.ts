/**
 * Standardized error creators for consistent error responses
 */

export function notFound(message: string = 'Resource not found') {
  return createError({
    statusCode: 404,
    statusMessage: message
  })
}

export function badRequest(message: string = 'Bad request') {
  return createError({
    statusCode: 400,
    statusMessage: message
  })
}

export function unauthorized(message: string = 'Unauthorized') {
  return createError({
    statusCode: 401,
    statusMessage: message
  })
}

export function forbidden(message: string = 'Forbidden') {
  return createError({
    statusCode: 403,
    statusMessage: message
  })
}

export function internalError(message: string = 'Internal server error') {
  return createError({
    statusCode: 500,
    statusMessage: message
  })
}

export function serviceUnavailable(message: string = 'Service unavailable') {
  return createError({
    statusCode: 503,
    statusMessage: message
  })
}

