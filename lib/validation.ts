export function sanitizeUsername(username: string): string {
  return username.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30)
}

export function validateUsername(username: string): {
  valid: boolean
  error?: string
  sanitized?: string
} {
  if (!username || username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }

  if (username.length > 30) {
    return { valid: false, error: 'Username must be less than 30 characters' }
  }

  const sanitized = sanitizeUsername(username)

  if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,29}$/.test(sanitized)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, hyphens, and underscores'
    }
  }

  return { valid: true, sanitized }
}
