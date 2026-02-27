export enum ErrorCode {
  PEER_CONNECTION_FAILED = 'PEER_CONNECTION_FAILED',
  AUDIO_INIT_FAILED = 'AUDIO_INIT_FAILED',
  AUTH_ERROR = 'AUTH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public userMessage: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleError(error: unknown, context: string) {
  if (error instanceof AppError) {
    console.error(`[${context}] ${error.code}:`, error.message, error)
  } else if (error instanceof Error) {
    console.error(`[${context}]`, error.message, error)
  } else {
    console.error(`[${context}] Unknown error:`, error)
  }
}
