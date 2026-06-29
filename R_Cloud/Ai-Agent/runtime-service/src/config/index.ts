/**
 * src/config/index.ts
 *
 * CONFIGURATION — Single source of all environment variables.
 *
 * Responsibilities:
 *  - Read all environment variables from process.env
 *  - Validate them using Zod schema (schema.ts)
 *  - Export a single typed `config` object used across the entire service
 *  - Crash immediately on startup if any required env var is missing or invalid
 *    (fail fast — never let a misconfigured service run silently)
 *
 * Usage:
 *  import { config } from '@/config';
 *  config.railway.apiToken
 *  config.database.url
 *  config.grpc.port
 *
 * Environment Variables Expected:
 *  - RAILWAY_API_TOKEN      → Token to authenticate with Railway GraphQL API
 *  - DATABASE_URL           → PostgreSQL connection string
 *  - REDIS_URL              → Redis connection string
 *  - NATS_URL               → NATS server connection URL
 *  - GRPC_PORT              → Port for gRPC server (default: 50051)
 *  - HTTP_PORT              → Port for health HTTP server (default: 3000)
 *  - HEALTH_CHECK_INTERVAL  → How often to ping runtimes in ms (default: 30000)
 *  - MAX_RESTART_ATTEMPTS   → Max restarts before marking runtime as permanently failed
 *  - NODE_ENV               → "development" | "production" | "test"
 *  - OTEL_EXPORTER_ENDPOINT → OpenTelemetry collector endpoint
 */
