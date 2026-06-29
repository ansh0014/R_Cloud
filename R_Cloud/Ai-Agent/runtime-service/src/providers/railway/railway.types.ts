/**
 * src/providers/railway/railway.types.ts
 *
 * RAILWAY TYPES — TypeScript type definitions for all Railway API responses.
 *
 * Responsibilities:
 *  - Define the exact shape of data returned by Railway's GraphQL API
 *  - These types are used ONLY inside the providers/railway/ folder
 *  - They should NOT leak into the rest of the application
 *    (the provisioner maps Railway types → internal runtime.types.ts)
 *
 * Types defined here:
 *  - RailwayService       → A Railway service object (id, name, projectId)
 *  - RailwayDeployment    → A Railway deployment object (id, status, url)
 *  - RailwayDeployStatus  → Enum of Railway deployment states
 *                           (BUILDING, DEPLOYING, SUCCESS, FAILED, CRASHED)
 *  - RailwayEnvironment   → Environment variables on a Railway service
 *  - RailwayError         → Shape of Railway API error responses
 *
 * Why separate from internal types?
 *  Railway's naming conventions and state names differ from ours.
 *  E.g., Railway calls it "SUCCESS" but we call it "RUNNING".
 *  Keeping them separate makes the mapping explicit and controlled.
 */
