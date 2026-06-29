/**
 * src/validation/runtime-id.schema.ts
 *
 * VALIDATION — Shared schema for requests that only need a runtimeId.
 *
 * Used by:
 *  - RestartRuntime handler
 *  - StopRuntime handler
 *  - DeleteRuntime handler
 *  - GetRuntimeStatus handler
 *
 * Validates:
 *  - runtimeId → non-empty string, valid UUID format
 *
 * Reusing one schema across multiple handlers avoids duplication.
 */
