/**
 * src/providers/railway/railway.errors.ts
 *
 * RAILWAY ERRORS — Custom error classes for Railway API failures.
 *
 * Responsibilities:
 *  - Define specific error types for different Railway failure scenarios
 *  - Each error carries the Railway API response for debugging
 *  - The error.interceptor maps these to appropriate gRPC status codes
 *
 * Error Classes:
 *  - RailwayApiError          → Generic Railway API call failure
 *                               (network error, unexpected response)
 *  - RailwayDeploymentFailed  → Railway returned a FAILED deployment status
 *  - RailwayServiceNotFound   → Tried to act on a service that doesn't exist on Railway
 *  - RailwayRateLimitError    → Hit Railway's API rate limit (429)
 *  - RailwayTimeoutError      → Railway API did not respond within the timeout window
 *
 * Usage:
 *  throw new RailwayDeploymentFailed("Build failed: missing requirements.txt", {
 *    serviceId: "svc_abc",
 *    railwayResponse: { ... }
 *  });
 */
