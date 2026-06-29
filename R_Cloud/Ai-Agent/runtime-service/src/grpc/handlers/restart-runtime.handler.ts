/**
 * src/grpc/handlers/restart-runtime.handler.ts
 *
 * HANDLER — RestartRuntime gRPC method.
 *
 * Called by: Deployment Service or AgentOps Service
 * When: A user manually triggers a restart from the dashboard,
 *       OR the Health Scheduler detects an unhealthy runtime.
 *
 * Input (RestartRuntimeRequest):
 *  - runtimeId → The ID of the runtime to restart
 *
 * Responsibilities (in order):
 *  1. Validate the incoming request
 *  2. Look up the runtime in PostgreSQL — verify it exists and is not already restarting
 *  3. Update runtime status in PostgreSQL to "RESTARTING"
 *  4. Call Railway API to restart the container
 *  5. Poll the runtime's /health endpoint until it returns healthy (or times out)
 *  6. Update runtime status in PostgreSQL to "RUNNING" (or "FAILED")
 *  7. Publish NATS event: "runtime.restarted" or "runtime.failed"
 *  8. Return { success: true } to the caller
 *
 * Error Cases:
 *  - Runtime not found          → Return gRPC NOT_FOUND status
 *  - Railway restart failed     → Update DB to "FAILED", publish event, return gRPC INTERNAL
 *  - Health check timed out     → Mark as "FAILED" after max attempts
 */
