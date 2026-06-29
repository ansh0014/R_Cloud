/**
 * src/provisioner/microservices.provisioner.ts
 *
 * MICROSERVICES PROVISIONER — Deploys multiple agent containers for A2A workflows.
 *
 * When is this used?
 *  When ragent.yaml specifies: mode: microservices
 *  Each agent (planner, researcher, reviewer, etc.) gets its own Railway container.
 *
 * Input:
 *  - agents: Array of { id, entrypoint } from ragent.yaml
 *    e.g. [{ id: "planner", entrypoint: "planner.py" }, ...]
 *  - repoUrl, branch, envVars (shared across all agents)
 *
 * Responsibilities (in order):
 *  1. Loop over each agent in the agents array
 *  2. For each agent, call railway.client.createService() with:
 *       - The same repoUrl and branch
 *       - A UNIQUE start command: "python <entrypoint>"
 *       - The shared envVars
 *  3. Collect all Railway service IDs
 *  4. Wait for ALL services to reach "SUCCESS" status (parallel polling)
 *  5. If ANY service fails → attempt to clean up ALL provisioned services
 *     (avoid orphaned Railway containers that cost money)
 *  6. Return array of { agentId, runtimeUrl, railwayServiceId }
 *
 * Failure Handling:
 *  - Partial failures (e.g. planner deployed but researcher failed):
 *    → Delete already-deployed containers on Railway
 *    → Mark entire deployment as FAILED
 *    → This prevents orphaned paid Railway resources
 *
 * Note: This is significantly more complex than monolith.
 *       Only implement after monolith provisioner is working and tested.
 */
