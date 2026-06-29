/**
 * src/errors/runtime.error.ts
 *
 * RUNTIME ERRORS — Error classes for runtime-related failures.
 *
 * Error Classes:
 *
 *  RuntimeNotFoundError:
 *    → Thrown when a runtimeId doesn't exist in the PostgreSQL registry
 *    → Maps to gRPC NOT_FOUND status
 *    → e.g. throw new RuntimeNotFoundError("run_abc")
 *
 *  RuntimeAlreadyRunningError:
 *    → Thrown when trying to deploy a runtime that already exists
 *    → Maps to gRPC ALREADY_EXISTS status
 *
 *  RuntimeInvalidStateError:
 *    → Thrown when an operation is invalid for the current status
 *    → e.g. trying to restart a runtime that is already DELETED
 *    → Maps to gRPC FAILED_PRECONDITION status
 *
 *  RuntimeMaxRestartsExceededError:
 *    → Thrown when restart count exceeds the configured maximum
 *    → Maps to gRPC RESOURCE_EXHAUSTED status
 */
