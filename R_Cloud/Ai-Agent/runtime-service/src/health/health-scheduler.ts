/**
 * src/health/health-scheduler.ts
 *
 * HEALTH SCHEDULER — Manages periodic health checks for all active runtimes.
 *
 * What does this do?
 *  On startup, loads all RUNNING runtimes from PostgreSQL.
 *  Then, on a fixed interval (default: 30 seconds), it health-checks
 *  every single registered runtime by pinging its /health endpoint.
 *
 * Responsibilities:
 *  - Maintain an internal registry of runtimes to monitor (in-memory map)
 *  - Expose addRuntime(runtimeId, runtimeUrl) → called after a successful deployment
 *  - Expose removeRuntime(runtimeId)           → called when a runtime is stopped/deleted
 *  - On each tick: pass all registered runtimes to the worker-pool for parallel checking
 *  - Receive health results from health-checker.ts
 *  - On UNHEALTHY result: delegate to restart-manager.ts
 *
 * Concurrency:
 *  Does NOT check all runtimes at the same time naively.
 *  Uses worker-pool.ts to cap concurrent checks (default: max 20 simultaneous).
 *
 * Lifecycle:
 *  - start() → begins the interval, called from index.ts on bootstrap
 *  - stop()  → clears the interval, called on graceful shutdown
 *
 * State:
 *  In-memory map is the CACHE. PostgreSQL is the source of truth.
 *  On service restart, the Reconciler re-populates this map from PostgreSQL.
 */
