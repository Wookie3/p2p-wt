export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null

  async init(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      })
    } catch (error) {
      console.error('Error accessing microphone:', error)
      throw error
    }
  }

  startRecording(onData?: (data: Blob) => void): void {
    if (!this.stream) {
      throw new Error('Audio stream not initialized')
    }

    this.audioChunks = []

    const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 24000 }
      : { mimeType: 'audio/webm' }

    this.mediaRecorder = new MediaRecorder(this.stream, options)

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data)
        if (onData) {
          onData(event.data)
        }
      }
    }

    this.mediaRecorder.start(100) // Collect 100ms chunks
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'))
        return
      }

      if (this.mediaRecorder.state === 'inactive') {
        resolve(new Blob(this.audioChunks, { type: 'audio/webm' }))
        return
      }

      const stopHandler = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        resolve(audioBlob)
        this.mediaRecorder?.removeEventListener('stop', stopHandler)
      }

      this.mediaRecorder.addEventListener('stop', stopHandler)
      this.mediaRecorder.stop()
    })
  }

  destroy(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
    }
    this.mediaRecorder = null
    this.stream = null
    this.audioChunks = []
  }
}
