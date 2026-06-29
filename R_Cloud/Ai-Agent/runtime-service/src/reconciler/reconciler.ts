/**
 * src/reconciler/reconciler.ts
 *
 * RECONCILER — Startup crash recovery mechanism.
 *
 * What problem does this solve?
 *  Imagine the Runtime Service crashes while deploying a runtime.
 *  PostgreSQL shows the runtime with status = "DEPLOYING".
 *  But did Railway actually finish? We don't know.
 *
 *  Without the reconciler, on restart:
 *  - The runtime stays stuck in "DEPLOYING" forever in the DB
 *  - It never gets added to the health-scheduler
 *  - The user's deployment is silently broken
 *
 *  With the reconciler, on restart:
 *  - It finds all runtimes with status = "DEPLOYING"
 *  - Checks Railway's actual state for each one
 *  - Corrects the DB to match reality
 *  - Adds RUNNING runtimes back to the health-scheduler
 *
 * Responsibilities:
 *  1. On every service startup, run before the gRPC server starts accepting calls
 *  2. Query PostgreSQL for runtimes with status in [DEPLOYING, RESTARTING]
 *  3. For each stuck runtime, call railway.client.getDeploymentStatus()
 *  4. If Railway shows SUCCESS → update DB to RUNNING, add to health-scheduler
 *  5. If Railway shows FAILED  → update DB to FAILED, publish "runtime.failed"
 *  6. If Railway shows still building → leave as DEPLOYING (short startup race condition)
 *  7. Also re-hydrate health-scheduler with ALL currently RUNNING runtimes
 *
 * When does this run?
 *  Once, during bootstrap in index.ts, before starting the gRPC server.
 *  It is NOT a recurring process — only runs at startup.
 */
