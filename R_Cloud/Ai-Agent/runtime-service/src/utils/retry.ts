/**
 * src/utils/retry.ts
 *
 * RETRY UTILITY — Retries a failing async function with exponential backoff.
 *
 * Usage:
 *  const result = await retry(
 *    () => railwayClient.createService(params),
 *    { attempts: 3, baseDelayMs: 1000, factor: 2 }
 *  );
 *
 * Behaviour:
 *  - Attempt 1: immediate
 *  - Attempt 2: wait 1000ms, then retry
 *  - Attempt 3: wait 2000ms, then retry
 *  - If all attempts fail: throw the last error
 *
 * When to use:
 *  - Railway API calls (transient network errors, 429 rate limits)
 *  - NATS publish calls (broker temporarily unavailable)
 *  - Do NOT use for operations that are guaranteed to fail
 *    (e.g. validation errors — retrying won't fix bad input)
 */
