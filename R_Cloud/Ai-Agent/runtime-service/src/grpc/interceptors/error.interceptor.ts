/**
 * src/grpc/interceptors/error.interceptor.ts
 *
 * INTERCEPTOR — Centralized Error Handling.
 *
 * Responsibilities:
 *  - Wrap every handler call in a try/catch
 *  - Catch any unhandled errors thrown by handlers
 *  - Map custom error classes to the correct gRPC status codes:
 *      - ValidationError    → gRPC INVALID_ARGUMENT (400 equivalent)
 *      - RuntimeNotFound    → gRPC NOT_FOUND (404 equivalent)
 *      - RailwayError       → gRPC INTERNAL (500 equivalent)
 *      - UnauthorizedError  → gRPC UNAUTHENTICATED (401 equivalent)
 *      - Unknown errors     → gRPC INTERNAL with a safe generic message
 *  - Log the full error internally (with stack trace) for debugging
 *  - Return a SAFE, clean error message to the caller (never expose internals)
 *
 * Why centralized?
 *  Without this interceptor, each handler would need its own try/catch
 *  and its own mapping logic. A single unhandled exception would crash
 *  the gRPC server. Centralizing this keeps handlers clean and safe.
 *
 * Example:
 *  Handler throws: new RailwayError("GraphQL mutation failed: timeout")
 *  Caller receives: { code: INTERNAL, message: "Runtime provisioning failed" }
 *  Internal log:    Full error with stack trace
 */
