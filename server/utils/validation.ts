/**
 * Common validation utilities
 */

/**
 * Validate that required fields are present
 */
export function validateRequired<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): void {
  const missing = fields.filter(field => !data[field] || (typeof data[field] === 'string' && !data[field].trim()))
  if (missing.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Missing required fields: ${missing.join(', ')}`
    })
  }
}

/**
 * Validate project ID format (lowercase, alphanumeric, hyphens only)
 */
export function validateProjectId(id: string): void {
  if (!/^[a-z0-9-]+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project ID must contain only lowercase letters, numbers, and hyphens'
    })
  }
}

/**
 * Validate submission status
 */
export function validateStatus(status: string): asserts status is 'pending' | 'approved' | 'rejected' {
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid status. Must be one of: pending, approved, rejected'
    })
  }
}

/**
 * Validate prompt difficulty
 */
export function validateDifficulty(difficulty: string): asserts difficulty is 'small' | 'medium' | 'advanced' {
  if (!['small', 'medium', 'advanced'].includes(difficulty)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid difficulty. Must be one of: small, medium, advanced'
    })
  }
}

/**
 * Validate file path ends with /index.html
 */
export function validateFilePath(filePath: string): void {
  if (!filePath.endsWith('/index.html')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File path must end with /index.html'
    })
  }
}

