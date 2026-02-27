import { describe, it, expect, beforeEach } from 'vitest'
import { AudioRecorder } from '@/lib/audio-recorder'

describe('AudioRecorder', () => {
  let recorder: AudioRecorder

  beforeEach(() => {
    recorder = new AudioRecorder()
  })

  it('should create a new AudioRecorder instance', () => {
    expect(recorder).toBeInstanceOf(AudioRecorder)
  })

  it('should have correct initial state', () => {
    expect(recorder).toBeDefined()
  })

  it('should throw error when stopping without initializing', async () => {
    await expect(recorder.stopRecording()).rejects.toThrow('MediaRecorder not initialized')
  })

  it('should throw error when starting without initializing', () => {
    expect(() => {
      recorder.startRecording()
    }).toThrow('Audio stream not initialized')
  })
})
