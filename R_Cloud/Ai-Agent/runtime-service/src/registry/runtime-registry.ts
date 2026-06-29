/**
 * src/registry/runtime-registry.ts
 *
 * RUNTIME REGISTRY — All PostgreSQL read/write operations for runtime state.
 *
 * What is the Runtime Registry?
 *  The PostgreSQL table that stores every runtime's current state.
 *  This is the SOURCE OF TRUTH for the entire service.
 *  In-memory maps (like the health-scheduler's) are just caches of this.
 *
 * Responsibilities:
 *  - createRuntime(data)           → Insert a new runtime record (status: DEPLOYING)
 *  - updateRuntimeStatus(id, status) → Update status (RUNNING, FAILED, STOPPED, etc.)
 *  - updateRuntimeUrl(id, url)     → Set the Railway public URL after deployment
 *  - incrementRestartCount(id)     → Increment restart counter on each restart
 *  - updateHealthStatus(id, health)→ Update last health check result and timestamp
 *  - getRuntimeById(id)            → Fetch one runtime record
 *  - getAllActiveRuntimes()         → Fetch all RUNNING runtimes (used by Reconciler + Scheduler)
 *  - deleteRuntime(id)             → Remove a runtime record permanently
 *
 * All functions return typed RuntimeRecord objects (see runtime-registry.types.ts).
 *
 * Rule: ALWAYS write to PostgreSQL BEFORE taking any action.
 *  e.g., update status to "RESTARTING" in DB first, THEN call Railway API.
 *  This ensures the DB reflects intent even if the service crashes mid-operation.
 */
