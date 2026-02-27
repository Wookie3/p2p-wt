// Audio configuration constants

export const AUDIO_CONFIG = {
  // Voice quality: 16kHz is optimal for speech
  SAMPLE_RATE: 16000,

  // 24kbps provides good voice quality with low bandwidth
  BITS_PER_SECOND: 24000,

  // 100ms chunks balance latency and reliability
  CHUNK_INTERVAL_MS: 100,

  // Audio enhancement settings
  ECHO_CANCELLATION: true,
  NOISE_SUPPRESSION: true,
  AUTO_GAIN_CONTROL: true,

  // Codec settings
  CODEC_MIME_TYPE: 'audio/webm;codecs=opus',
} as const
