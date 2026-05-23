import { sanitizeUsername } from '@/lib/validation'

describe('sanitizeUsername', () => {
  it('should remove special characters', () => {
    expect(sanitizeUsername('user@name')).toBe('username')
    expect(sanitizeUsername('user#123')).toBe('user123')
    expect(sanitizeUsername('user.name')).toBe('username')
  })

  it('should keep alphanumeric characters', () => {
    expect(sanitizeUsername('User123')).toBe('User123')
    expect(sanitizeUsername('test_user-01')).toBe('test_user-01')
  })

  it('should limit to 30 characters', () => {
    const longUsername = 'a'.repeat(50)
    expect(sanitizeUsername(longUsername)).length.toBe(30)
  })

  it('should handle empty string', () => {
    expect(sanitizeUsername('')).toBe('')
  })
})
