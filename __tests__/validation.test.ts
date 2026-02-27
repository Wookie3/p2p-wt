import { validateUsername } from '@/lib/validation'

describe('validateUsername', () => {
  it('should accept valid usernames', () => {
    expect(validateUsername('RunningDuck')).toEqual({ valid: true })
    expect(validateUsername('user123')).toEqual({ valid: true })
    expect(validateUsername('Test_User-01')).toEqual({ valid: true })
  })

  it('should accept minimum length username', () => {
    const result = validateUsername('abc')
    expect(result.valid).toBe(true)
    expect(result.sanitized).toBe('abc')
  })

  it('should accept maximum length username', () => {
    const result = validateUsername('a'.repeat(30))
    expect(result.valid).toBe(true)
    expect(result.sanitized).length.toBeLessThanOrEqual(30)
  })

  it('should reject usernames that are too short', () => {
    expect(validateUsername('ab')).toEqual({
      valid: false,
      error: 'Username must be at least 3 characters'
    })
  })

  it('should reject usernames that are too long', () => {
    expect(validateUsername('a'.repeat(31))).toEqual({
      valid: false,
      error: 'Username must be less than 30 characters'
    })
  })

  it('should reject empty username', () => {
    expect(validateUsername('')).toEqual({
      valid: false,
      error: 'Username must be at least 3 characters'
    })
  })

  it('should reject usernames with invalid characters', () => {
    expect(validateUsername('user@name')).toEqual({
      valid: false,
      error: 'Username can only contain letters, numbers, hyphens, and underscores'
    })

    expect(validateUsername('user.name')).toEqual({
      valid: false,
      error: 'Username can only contain letters, numbers, hyphens, and underscores'
    })

    expect(validateUsername('user name')).toEqual({
      valid: false,
      error: 'Username can only contain letters, numbers, hyphens, and underscores'
    })
  })

  it('should reject usernames starting with invalid character', () => {
    expect(validateUsername('1user')).toEqual({
      valid: false,
      error: 'Username can only contain letters, numbers, hyphens, and underscores'
    })

    expect(validateUsername('-user')).toEqual({
      valid: false,
      error: 'Username can only contain letters, numbers, hyphens, and underscores'
    })

    expect(validateUsername('_user')).toEqual({
      valid: false,
      error: 'Username can only contain letters, numbers, hyphens, and underscores'
    })
  })

  it('should sanitize special characters from username', () => {
    expect(validateUsername('user@name#123')).toEqual({
      valid: true,
      sanitized: 'username123'
    })
  })
})
