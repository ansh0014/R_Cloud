/**
 * src/errors/base.error.ts
 *
 * BASE ERROR — The parent class for all custom errors in this service.
 *
 * Why custom errors?
 *  Using plain "throw new Error('something failed')" loses all context.
 *  Custom error classes carry:
 *    - A machine-readable error code (for the error.interceptor to map to gRPC status)
 *    - A human-readable message (safe to return to the caller)
 *    - Optional metadata (for internal logging only)
 *    - Proper stack traces
 *
 * BaseError properties:
 *  - code     → string, e.g. "RUNTIME_NOT_FOUND", "RAILWAY_TIMEOUT"
 *  - message  → string, safe to return to callers
 *  - metadata → any, internal debug info (NEVER sent to callers)
 *
 * All other error classes in this folder extend BaseError.
 */
