/**
 * src/utils/timeout.ts
 *
 * TIMEOUT UTILITY — Wraps a Promise with a maximum wait time.
 *
 * Usage:
 *  const result = await withTimeout(
 *    fetch(runtimeUrl + '/health'),
 *    5000,  // 5 seconds max
 *    'Health check timed out'
 *  );
 *
 * Behaviour:
 *  - If the promise resolves within the timeout → return the result
 *  - If the promise exceeds the timeout → throw a TimeoutError
 *
 * When to use:
 *  - Every /health ping on a runtime (a hung runtime must not block forever)
 *  - Railway API calls (should not wait indefinitely)
 *  - Any external network call where the remote could be unresponsive
 *
 * This is one of the most important utilities in the service.
 * A service that hangs on external calls will eventually exhaust
 * the worker pool and stop checking all other runtimes.
 */
