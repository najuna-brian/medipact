/**
 * Production Logger
 * 
 * Centralized logging utility for production environments.
 * Supports different log levels and structured logging.
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLogLevel = process.env.LOG_LEVEL 
  ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO
  : (process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG);

/**
 * Format log message with timestamp and context
 */
function formatLog(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...context
  };
  
  // In production, output as JSON for log aggregation tools
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(logEntry);
  }
  
  // In development, output as readable format
  const contextStr = Object.keys(context).length > 0 
    ? ` ${JSON.stringify(context)}` 
    : '';
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
}

/**
 * Error logger
 */
export function logError(message, error = null, context = {}) {
  if (currentLogLevel >= LOG_LEVELS.ERROR) {
    const errorContext = {
      ...context,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      })
    };
    console.error(formatLog('ERROR', message, errorContext));
  }
}

/**
 * Warning logger
 */
export function logWarn(message, context = {}) {
  if (currentLogLevel >= LOG_LEVELS.WARN) {
    console.warn(formatLog('WARN', message, context));
  }
}

/**
 * Info logger
 */
export function logInfo(message, context = {}) {
  if (currentLogLevel >= LOG_LEVELS.INFO) {
    console.log(formatLog('INFO', message, context));
  }
}

/**
 * Debug logger (only in development)
 */
export function logDebug(message, context = {}) {
  if (currentLogLevel >= LOG_LEVELS.DEBUG && process.env.NODE_ENV !== 'production') {
    console.log(formatLog('DEBUG', message, context));
  }
}

/**
 * Security event logger (for audit trail)
 */
export function logSecurityEvent(event, details = {}) {
  logInfo(`SECURITY: ${event}`, {
    type: 'security',
    event,
    ...details
  });
}

/**
 * Business event logger (for analytics)
 */
export function logBusinessEvent(event, details = {}) {
  logInfo(`BUSINESS: ${event}`, {
    type: 'business',
    event,
    ...details
  });
}

/**
 * Performance logger
 */
export function logPerformance(operation, duration, context = {}) {
  if (duration > 1000) { // Log slow operations (>1s)
    logWarn(`SLOW_OPERATION: ${operation} took ${duration}ms`, {
      type: 'performance',
      operation,
      duration,
      ...context
    });
  } else if (currentLogLevel >= LOG_LEVELS.DEBUG) {
    logDebug(`PERF: ${operation} took ${duration}ms`, context);
  }
}

