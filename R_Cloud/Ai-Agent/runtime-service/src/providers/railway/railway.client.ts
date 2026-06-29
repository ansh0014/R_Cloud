/**
 * src/providers/railway/railway.client.ts
 *
 * RAILWAY CLIENT — The ONLY file in the entire service that talks to Railway.
 *
 * What is a provider?
 *  A provider is an adapter for an external service. It isolates all
 *  external API communication behind a clean interface. If Railway changes
 *  their API tomorrow, you update ONLY this file. Nothing else changes.
 *
 * Responsibilities:
 *  - Authenticate with Railway using the API token from config
 *  - Expose clean TypeScript methods for each Railway operation:
 *      - createService(repoUrl, branch, envVars) → returns Railway service ID + URL
 *      - getDeploymentStatus(serviceId)          → returns current Railway deployment state
 *      - restartService(serviceId)               → triggers a Railway container restart
 *      - stopService(serviceId)                  → stops the Railway container
 *      - deleteService(serviceId)                → permanently destroys the Railway service
 *  - Handle Railway API errors and wrap them in RailwayError (see railway.errors.ts)
 *  - Apply timeouts to every API call (never wait forever)
 *  - Apply retry logic for transient failures (network hiccup, 429 rate limit)
 *
 * Railway API Details:
 *  - Railway uses a GraphQL API (NOT REST)
 *  - Base URL: https://backboard.railway.app/graphql/v2
 *  - Auth: Bearer token in Authorization header
 *  - Read railway.types.ts for the shape of all Railway API responses
 *
 * Note: Do NOT import this file directly into handlers.
 *       Handlers call the provisioner, which calls this client.
 */
