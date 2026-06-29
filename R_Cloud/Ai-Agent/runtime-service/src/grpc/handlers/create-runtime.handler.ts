/**
 * src/grpc/handlers/create-runtime.handler.ts
 *
 * HANDLER — CreateRuntime gRPC method.
 *
 * Called by: Deployment Service
 * When: A validated AI project is ready to be deployed to Railway.
 *
 * Input (CreateRuntimeRequest):
 *  - deploymentId  → Unique ID from Deployment Service
 *  - repoUrl       → GitHub repository URL
 *  - branch        → Git branch to deploy (e.g. "main")
 *  - mode          → "monolith" | "microservices"
 *  - envVars       → Map of environment variables (API keys, secrets, etc.)
 *
 * Responsibilities (in order):
 *  1. Validate the incoming request using validation/create-runtime.schema.ts
 *  2. Write a runtime record to PostgreSQL with status = "DEPLOYING"
 *  3. Route to the correct provisioner based on mode:
 *     - monolith       → provisioner/monolith.provisioner.ts
 *     - microservices  → provisioner/microservices.provisioner.ts
 *  4. Provisioner returns the Railway runtime URL
 *  5. Update the runtime record in PostgreSQL with status = "RUNNING" and URL
 *  6. Register the runtime in the Health Scheduler for periodic monitoring
 *  7. Publish NATS event: "runtime.started"
 *  8. Return { runtimeId, runtimeUrl, status } to the Deployment Service
 *
 * Error Cases:
 *  - Validation failed       → Return gRPC INVALID_ARGUMENT status
 *  - Railway deploy failed   → Update DB status to "FAILED", publish "runtime.failed", return gRPC INTERNAL
 *  - Health check failed     → Attempt restart, if unrecoverable return gRPC INTERNAL
 */
