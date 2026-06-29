/**
 * src/health/worker-pool.ts
 *
 * WORKER POOL — Bounded concurrency control for health checks.
 *
 * Why does this exist?
 *  If you have 500 runtimes to health-check and you do:
 *    await Promise.all(runtimes.map(r => checkHealth(r)))
 *  You fire 500 simultaneous HTTP requests. This can:
 *    - Overwhelm your network
 *    - Exhaust Node.js's connection pool
 *    - Hit rate limits on external services
 *
 *  The worker pool limits this to N concurrent checks at a time.
 *  e.g. max 20 simultaneous health checks, rest wait in queue.
 *
 * Responsibilities:
 *  - Accept a list of tasks (health check jobs)
 *  - Process them with at most N concurrent workers (configurable)
 *  - Collect and return all results after all tasks complete
 *  - Individual task failures do NOT stop other tasks
 *
 * Usage:
 *  const results = await workerPool(
 *    runtimes.map(r => () => healthChecker.check(r)),
 *    { concurrency: 20 }
 *  );
 *
 * This is a generic utility — it knows nothing about health checks specifically.
 * It just runs async functions with bounded concurrency.
 */
