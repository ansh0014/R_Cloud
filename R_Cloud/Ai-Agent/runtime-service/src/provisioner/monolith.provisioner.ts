/**
 * src/provisioner/monolith.provisioner.ts
 *
 * MONOLITH PROVISIONER — Deploys a single-container AI application to Railway.
 *
 * When is this used?
 *  When ragent.yaml specifies: mode: monolith
 *  The entire application runs as one container on Railway.
 *
 * Responsibilities (in order):
 *  1. Call railway.client.createService() with the repo URL, branch, and env vars
 *  2. Poll railway.client.getDeploymentStatus() until:
 *       - Status becomes "SUCCESS" → proceed
 *       - Status becomes "FAILED"  → throw RailwayDeploymentFailed
 *       - Timeout (e.g. 5 minutes) → throw RailwayTimeoutError
 *  3. Extract the public URL from the Railway response
 *  4. Return { runtimeUrl, railwayServiceId } to the provisioner router
 *
 * Polling Strategy:
 *  - Poll every 5 seconds
 *  - Max wait: 5 minutes (configurable)
 *  - Uses utils/sleep.ts for the delay between polls
 *
 * This is the SIMPLER of the two provisioners.
 * Implement and fully test this before touching microservices.provisioner.ts
 */
