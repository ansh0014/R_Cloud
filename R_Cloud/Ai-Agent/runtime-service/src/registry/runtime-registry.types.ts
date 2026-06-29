/**
 * src/registry/runtime-registry.types.ts
 *
 * REGISTRY TYPES — TypeScript types for runtime records stored in PostgreSQL.
 *
 * Types defined here:
 *
 *  RuntimeStatus (enum):
 *    - DEPLOYING       → Being provisioned on Railway right now
 *    - RUNNING         → Deployed and healthy
 *    - RESTARTING      → A restart has been triggered
 *    - STOPPING        → A stop has been triggered
 *    - STOPPED         → Manually stopped, container is paused
 *    - FAILED          → Deployment or health checks failed (recoverable)
 *    - PERMANENTLY_FAILED → Exceeded max restart attempts, needs manual intervention
 *    - DELETED         → Removed from Railway (kept for history)
 *
 *  HealthStatus (enum):
 *    - HEALTHY         → Last /health check returned 200 + healthy
 *    - UNHEALTHY       → Last /health check failed or returned unhealthy
 *    - UNKNOWN         → Not yet checked or check is in progress
 *
 *  RuntimeRecord (interface):
 *    - id              → Internal UUID
 *    - deploymentId    → ID from the Deployment Service
 *    - railwayServiceId→ ID of the service on Railway (for API calls)
 *    - runtimeUrl      → Public URL of the deployed application
 *    - status          → RuntimeStatus
 *    - health          → HealthStatus
 *    - mode            → "monolith" | "microservices"
 *    - restartCount    → Number of auto-restarts performed
 *    - lastHealthCheck → Timestamp of last /health ping
 *    - createdAt       → When this runtime was first provisioned
 *    - updatedAt       → When this record was last modified
 */
