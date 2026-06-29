/**
 * src/utils/sleep.ts
 *
 * SLEEP UTILITY — Pauses execution for a given number of milliseconds.
 *
 * Usage:
 *  await sleep(5000); // wait 5 seconds
 *
 * When to use:
 *  - Between deployment status polls (e.g. check Railway every 5 seconds
 *    while waiting for a container to start)
 *  - Between retry attempts in retry.ts
 *
 * Implementation:
 *  A simple Promise wrapper around setTimeout.
 *  Never use a blocking while-loop for delays in Node.js.
 */
