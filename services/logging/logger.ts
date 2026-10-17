export type LogMetadata = Record<string, unknown>;
export interface Logger {
  debug(message: string, metadata?: LogMetadata): void;
  info(message: string, metadata?: LogMetadata): void;
  warn(message: string, metadata?: LogMetadata): void;
  error(message: string, metadata?: LogMetadata): void;
}

const sensitiveKeyPattern = /password|token|authorization|email|phone|name|room|reservation|member|secret|credential/i;

export function sanitizeMetadata(metadata?: LogMetadata): LogMetadata | undefined {
  if (!metadata) return undefined;
  return Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key, sensitiveKeyPattern.test(key) ? '[REDACTED]' : sanitizeValue(value)]));
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (typeof value === 'object' && value !== null) return sanitizeMetadata(value as LogMetadata);
  return value;
}

export class ConsoleLogger implements Logger {
  constructor(private readonly production: boolean) {}
  debug(message: string, metadata?: LogMetadata) { if (!this.production) console.debug(message, sanitizeMetadata(metadata)); }
  info(message: string, metadata?: LogMetadata) { console.info(message, sanitizeMetadata(metadata)); }
  warn(message: string, metadata?: LogMetadata) { console.warn(message, sanitizeMetadata(metadata)); }
  error(message: string, metadata?: LogMetadata) { console.error(message, sanitizeMetadata(metadata)); }
}
