type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  timestamp: string
  message: string
  context?: Record<string, any>
  userId?: string
  requestId?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private format(entry: LogEntry): string {
    return JSON.stringify(entry)
  }

  info(message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      context
    }

    console.log(this.format(entry))
    this.logs.push(entry)

    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  warn(message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      context
    }
    console.warn(this.format(entry))
    this.logs.push(entry)

    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      context: {
        ...context,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      }
    }
    console.error(this.format(entry))
    this.logs.push(entry)

    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  debug(message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: 'debug',
      timestamp: new Date().toISOString(),
      message,
      context
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug(this.format(entry))
    }

    this.logs.push(entry)

    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clear() {
    this.logs = []
  }
}

export const logger = new Logger()
