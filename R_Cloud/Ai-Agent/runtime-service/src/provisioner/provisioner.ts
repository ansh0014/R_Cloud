/**
 * src/provisioner/provisioner.ts
 *
 * PROVISIONER — Entry point that routes to the correct deployment strategy.
 *
 * Responsibilities:
 *  - Receive a deployment request from the CreateRuntime handler
 *  - Read the "mode" field from the request:
 *      - "monolith"      → delegate to monolith.provisioner.ts
 *      - "microservices" → delegate to microservices.provisioner.ts
 *  - Return a unified ProvisionResult regardless of which strategy was used
 *
 * Output (ProvisionResult):
 *  - runtimeUrl     → The public URL(s) of the deployed application
 *  - railwayIds     → The Railway service ID(s) for future management
 *  - status         → Final deployment status
 *
 * Why a separate router file?
 *  Handlers should not contain conditional deployment logic.
 *  This file is the single place where "which mode am I in?" is answered.
 *  Adding new deployment modes (e.g. "serverless") means adding a new
 *  provisioner file and one line here — nothing else changes.
 */
