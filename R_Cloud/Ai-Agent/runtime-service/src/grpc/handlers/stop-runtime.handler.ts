/**
 * src/grpc/handlers/stop-runtime.handler.ts
 *
 * HANDLER — StopRuntime gRPC method.
 *
 * Called by: Deployment Service or AgentOps Service
 * When: A user manually stops a running runtime from the dashboard.
 *
 * Input (StopRuntimeRequest):
 *  - runtimeId → The ID of the runtime to stop
 *
 * Responsibilities (in order):
 *  1. Validate the incoming request
 *  2. Look up the runtime in PostgreSQL — verify it exists and is currently RUNNING
 *  3. Remove the runtime from the Health Scheduler (stop monitoring it)
 *  4. Update runtime status in PostgreSQL to "STOPPING"
 *  5. Call Railway API to stop the container
 *  6. Update runtime status in PostgreSQL to "STOPPED"
 *  7. Publish NATS event: "runtime.stopped"
 *  8. Return { success: true } to the caller
 *
 * Error Cases:
 *  - Runtime not found          → Return gRPC NOT_FOUND status
 *  - Runtime already stopped    → Return gRPC FAILED_PRECONDITION status
 *  - Railway stop failed        → Return gRPC INTERNAL status
 *
 * Note: A stopped runtime is NOT deleted. It can be restarted again.
 *       For permanent removal, use DeleteRuntime.
 */
