import pino from 'pino'
import { config } from '../config/config.js'

/**
 * Centralized Pino logger for the Runtime Service.
 *
 * Usage:
 *   import { logger } from '../telemetry/logger.js'
 *   logger.info('Server started')
 *   logger.error({ err }, 'Something went wrong')
 *   logger.info({ runtimeId, deploymentId }, 'Runtime created')
 */
export const logger = pino({
  level: config.LOG_LEVEL,

  // Pretty-print in development, raw JSON in production (for log aggregators)
  transport:
    config.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,

  // Base fields on every log line
  base: {
    service: config.OTEL_SERVICE_NAME,
    env: config.NODE_ENV,
  },

  // Rename 'msg' → 'message' for compatibility with log aggregators
  messageKey: 'message',

  // ISO timestamp on every line
  timestamp: pino.stdTimeFunctions.isoTime,
})

export type Logger = typeof logger
