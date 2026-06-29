/**
 * src/health/health-checker.ts
 *
 * HEALTH CHECKER — Pings the /health endpoint of a single runtime.
 *
 * Responsibilities:
 *  - Accept a runtimeUrl as input
 *  - Make an HTTP GET request to: runtimeUrl + "/health"
 *  - Enforce a strict timeout (default: 5 seconds) on the request
 *  - Interpret the result:
 *      - HTTP 200 + { status: "healthy" } → return HealthStatus.HEALTHY
 *      - HTTP 200 + { status: "unhealthy"} → return HealthStatus.UNHEALTHY
 *      - Non-200 response                  → return HealthStatus.UNHEALTHY
 *      - Timeout / network error           → return HealthStatus.UNHEALTHY
 *
 * Output:
 *  { runtimeId: string, status: "HEALTHY" | "UNHEALTHY", latencyMs: number }
 *
 * This file has a single job: check one runtime, return a result.
 * It does NOT decide what to do with the result.
 * That is the health-scheduler's job (and restart-manager's job).
 *
 * Why strict timeout?
 *  A hanging health check (no timeout) would block the worker pool slot
 *  indefinitely, preventing other runtimes from being checked.
 *  Always use utils/timeout.ts wrapper here.
 */
