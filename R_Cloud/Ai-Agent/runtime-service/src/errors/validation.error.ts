/**
 * src/errors/validation.error.ts
 *
 * VALIDATION ERROR — Thrown when gRPC request input fails Zod validation.
 *
 *  ValidationError:
 *    → Thrown by any handler when schema.parse() fails
 *    → Carries the Zod error details (which fields failed, why)
 *    → Maps to gRPC INVALID_ARGUMENT status
 *    → The error message returned to the caller lists the specific field issues
 *
 * Usage:
 *  try {
 *    const validated = createRuntimeSchema.parse(request);
 *  } catch (zodError) {
 *    throw new ValidationError(zodError);
 *  }
 */
