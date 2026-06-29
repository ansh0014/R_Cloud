/**
 * src/config/schema.ts
 *
 * CONFIGURATION SCHEMA — Zod validation schema for all environment variables.
 *
 * Responsibilities:
 *  - Define the exact shape and type of every environment variable
 *  - Apply defaults for optional variables
 *  - Provide clear validation error messages when env vars are wrong
 *  - Parse and coerce types (e.g., string "50051" → number 50051)
 *
 * This file is used only by config/index.ts.
 * No other file should import from here directly.
 */
