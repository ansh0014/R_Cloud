/**
 * src/validation/create-runtime.schema.ts
 *
 * VALIDATION — Zod schema for the CreateRuntime gRPC request.
 *
 * Why validate gRPC input?
 *  Even though gRPC enforces the proto contract (field types),
 *  it doesn't validate business rules. A string field in proto
 *  can be empty, too long, or contain invalid characters.
 *  Zod validation catches these BEFORE any business logic runs.
 *
 * Validates:
 *  - deploymentId  → non-empty string, expected format (e.g. "dep_" prefix)
 *  - repoUrl       → valid GitHub URL (must start with https://github.com/)
 *  - branch        → non-empty string, max 100 characters
 *  - mode          → must be exactly "monolith" or "microservices"
 *  - envVars       → object with string keys and string values (no nested objects)
 *  - agents        → required only when mode = "microservices", array of { id, entrypoint }
 *
 * Usage in handler:
 *  const validated = createRuntimeSchema.parse(request);
 *  // Throws ValidationError if invalid
 *  // Returns typed, clean object if valid
 */
