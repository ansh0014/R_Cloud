/**
 * src/grpc/handlers/get-runtime-status.handler.ts
 *
 * HANDLER — GetRuntimeStatus gRPC method.
 *
 * Called by: Deployment Service, AgentOps Service
 * When: Any service needs to query the current state of a runtime.
 *       Also used by the frontend dashboard indirectly via AgentOps.
 *
 * Input (GetRuntimeStatusRequest):
 *  - runtimeId → The ID of the runtime to query
 *
 * Responsibilities:
 *  1. Validate the incoming request
 *  2. Look up the runtime record in PostgreSQL (read from Runtime Registry)
 *  3. Return the current state to the caller
 *
 * Output (GetRuntimeStatusResponse):
 *  - runtimeId    → The runtime ID
 *  - status       → "DEPLOYING" | "RUNNING" | "RESTARTING" | "STOPPING" | "STOPPED" | "FAILED"
 *  - runtimeUrl   → The public Railway URL (null if not yet deployed)
 *  - health       → "HEALTHY" | "UNHEALTHY" | "UNKNOWN"
 *  - restartCount → How many times this runtime has been auto-restarted
 *  - createdAt    → ISO timestamp of when the runtime was first created
 *  - updatedAt    → ISO timestamp of last status update
 *
 * Note: This handler is READ-ONLY. It never modifies any state.
 *       It is the simplest handler — a good starting point when learning gRPC.
 */
