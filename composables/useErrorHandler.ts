/**
 * Composable for consistent error handling
 * Standardizes error message extraction and provides better error messages
 */
export function useErrorHandler() {
  /**
   * Extract error message from error object
   * Standardizes on error.data?.statusMessage with fallbacks
   */
  function getErrorMessage(error: any): string {
    if (!error) return 'An unexpected error occurred'
    
    // Try statusMessage first (standard API error format)
    if (error.data?.statusMessage) {
      return error.data.statusMessage
    }
    
    // Try message property
    if (error.data?.message) {
      return error.data.message
    }
    
    // Try top-level message
    if (error.message) {
      // Provide better context for common error types
      if (error.message.includes('fetch')) {
        return 'Network error - please check your connection and try again'
      }
      if (error.message.includes('timeout')) {
        return 'Request timed out - please try again'
      }
      return error.message
    }
    
    // Try statusCode to provide generic messages
    if (error.statusCode) {
      switch (error.statusCode) {
        case 400:
          return 'Invalid request - please check your input'
        case 401:
          return 'Unauthorized - please log in'
        case 403:
          return 'Forbidden - you don\'t have permission'
        case 404:
          return 'Resource not found'
        case 409:
          return 'Conflict - this resource already exists'
        case 500:
          return 'Server error - please try again later'
        case 503:
          return 'Service unavailable - please try again later'
        default:
          return `Error ${error.statusCode} - please try again`
      }
    }
    
    // Fallback
    return 'An unexpected error occurred. Please try again.'
  }

  /**
   * Determine error type for better UX
   */
  function getErrorType(error: any): 'network' | 'server' | 'validation' | 'not-found' | 'unknown' {
    if (!error) return 'unknown'
    
    const message = String(error.message || '').toLowerCase()
    const statusCode = error.statusCode || error.data?.statusCode
    
    if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch')) {
      return 'network'
    }
    
    if (statusCode === 404) {
      return 'not-found'
    }
    
    if (statusCode === 400 || statusCode === 422) {
      return 'validation'
    }
    
    if (statusCode >= 500) {
      return 'server'
    }
    
    return 'unknown'
  }

  return {
    getErrorMessage,
    getErrorType
  }
}


