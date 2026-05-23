import { useCallback, useRef, useState } from 'react'
import { AudioRecorder } from '@/lib/audio-recorder'

export function useAudioRecorder() {
  const recorderRef = useRef<AudioRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const init = useCallback(async () => {
    if (recorderRef.current) return

    try {
      recorderRef.current = new AudioRecorder()
      await recorderRef.current.init()
      setIsInitialized(true)
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error initializing audio recorder:', err)
    }
  }, [])

  const start = useCallback((onData: (data: Blob) => void) => {
    if (!recorderRef.current || !isInitialized) {
      throw new Error('AudioRecorder not initialized')
    }

    try {
      recorderRef.current.startRecording(onData)
      setIsRecording(true)
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error starting recording:', err)
    }
  }, [isInitialized])

  const stop = useCallback(async () => {
    if (!recorderRef.current) {
      throw new Error('AudioRecorder not initialized')
    }

    try {
      const blob = await recorderRef.current.stopRecording()
      setIsRecording(false)
      setError(null)
      return blob
    } catch (err) {
      setError(err as Error)
      console.error('Error stopping recording:', err)
      return null
    }
  }, [])

  const destroy = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.destroy()
      recorderRef.current = null
    }
    setIsRecording(false)
    setIsInitialized(false)
    setError(null)
  }, [])

  return { init, start, stop, destroy, isRecording, isInitialized, error }
}
