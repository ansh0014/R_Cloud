/**
 * src/health/restart-manager.ts
 *
 * RESTART MANAGER — Decides whether and how to restart an unhealthy runtime.
 *
 * Responsibilities:
 *  - Receive an unhealthy runtime from the health-scheduler
 *  - Read the runtime's current restart count from PostgreSQL
 *  - Apply the restart policy:
 *      - If restartCount < MAX_RESTART_ATTEMPTS → trigger a restart
 *      - If restartCount >= MAX_RESTART_ATTEMPTS → mark as PERMANENTLY_FAILED, stop monitoring
 *
 * Restart Flow:
 *  1. Increment restartCount in PostgreSQL
 *  2. Update runtime status to "RESTARTING"
 *  3. Call railway.client.restartService()
 *  4. Wait for /health to return healthy (using health-checker.ts)
 *  5. If healthy → update status to "RUNNING", publish "runtime.restarted"
 *  6. If still unhealthy after restart → increment count again, check policy
 *
 * Permanently Failed:
 *  - Update status to "FAILED" in PostgreSQL
 *  - Remove from health-scheduler (stop monitoring)
 *  - Publish NATS event: "runtime.permanently_failed"
 *  - The AgentOps dashboard will alert the user
 *
 * Config:
 *  MAX_RESTART_ATTEMPTS is set in config/index.ts via env var.
 *  Default: 3 attempts before marking as permanently failed.
 */
