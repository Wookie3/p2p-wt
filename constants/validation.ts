// Validation constants

export const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  USERNAME_PATTERN: /^[a-zA-Z][a-zA-Z0-9_-]{0,29}$/,
} as const
