/**
 * src/grpc/interceptors/logger.interceptor.ts
 *
 * INTERCEPTOR — Request & Response Logging.
 *
 * Responsibilities:
 *  - Log every incoming gRPC call with:
 *      - Method name (e.g. "CreateRuntime")
 *      - Caller service identity (from metadata)
 *      - Timestamp of when the call started
 *  - Log the result of every call with:
 *      - Status code (OK, INTERNAL, NOT_FOUND, etc.)
 *      - Duration in milliseconds
 *  - Never log sensitive data:
 *      - envVars (contains API keys and secrets)
 *      - auth tokens
 *
 * Log Format (structured JSON via Pino):
 *  {
 *    "level": "info",
 *    "method": "CreateRuntime",
 *    "caller": "deployment-service",
 *    "status": "OK",
 *    "durationMs": 342,
 *    "timestamp": "2025-01-01T10:00:00Z"
 *  }
 *
 * This interceptor runs BEFORE auth.interceptor so even rejected
 * calls are logged for audit purposes.
 */
