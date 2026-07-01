type LogLevel = 'info' | 'warn' | 'error'

type LogFields = Record<string, unknown>

function serializeError(error: unknown): LogFields {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
    }
  }
  return { errorMessage: String(error) }
}

function emit(level: LogLevel, event: string, fields?: LogFields): void {
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...fields,
  }

  const line = JSON.stringify(payload)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export function logInfo(event: string, fields?: LogFields): void {
  emit('info', event, fields)
}

export function logWarn(event: string, fields?: LogFields): void {
  emit('warn', event, fields)
}

export function logError(event: string, error: unknown, fields?: LogFields): void {
  emit('error', event, { ...fields, ...serializeError(error) })
}
