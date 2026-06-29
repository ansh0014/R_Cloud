/**
 * src/grpc/handlers/delete-runtime.handler.ts
 *
 * HANDLER — DeleteRuntime gRPC method.
 *
 * Called by: Deployment Service
 * When: A user permanently deletes a project or deployment.
 *
 * Input (DeleteRuntimeRequest):
 *  - runtimeId → The ID of the runtime to permanently delete
 *
 * Responsibilities (in order):
 *  1. Validate the incoming request
 *  2. Look up the runtime in PostgreSQL — verify it exists
 *  3. Remove the runtime from the Health Scheduler (stop all monitoring)
 *  4. Call Railway API to permanently destroy the container and service
 *  5. Delete the runtime record from PostgreSQL
 *  6. Publish NATS event: "runtime.deleted"
 *  7. Return { success: true } to the caller
 *
 * Error Cases:
 *  - Runtime not found          → Return gRPC NOT_FOUND status
 *  - Railway delete failed      → Return gRPC INTERNAL (do NOT delete from DB yet)
 *
 * Note: This is PERMANENT. Unlike stop, the container is destroyed on Railway.
 *       There is no recovery after delete. The Deployment Service manages versioning.
 */
