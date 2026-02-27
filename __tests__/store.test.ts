import { describe, it, expect } from 'vitest'
import { useStore } from '@/store/useStore'

// Note: We can't fully test Zustand hooks in Vitest without setup
// These are basic structure tests

describe('useStore', () => {
  it('should be defined', () => {
    expect(useStore).toBeDefined()
  })

  it('should have the correct initial state', () => {
    const state = useStore.getState()
    expect(state.currentUser).toBe(null)
    expect(state.contacts).toEqual([])
    expect(state.friendRequests).toEqual([])
  })
})
