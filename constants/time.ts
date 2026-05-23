// Time-related constants

export const TIME = {
  // Anonymous session duration
  ANONYMOUS_SESSION_DURATION: 12 * 60 * 60 * 1000, // 12 hours

  // Call timeout
  CALL_TIMEOUT: 5000, // 5 seconds

  // Rate limiting
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,

  // Connection cleanup
  CONNECTION_CLEANUP_DELAY: 1000, // 1 second
} as const
