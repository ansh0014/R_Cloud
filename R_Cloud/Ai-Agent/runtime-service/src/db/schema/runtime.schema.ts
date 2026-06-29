/**
 * src/db/schema/runtime.schema.ts
 *
 * DATABASE SCHEMA — Drizzle ORM table definition for the runtimes table.
 *
 * Defines the "runtimes" table in PostgreSQL with all columns:
 *
 *  id                → UUID, primary key, auto-generated
 *  deployment_id     → VARCHAR, ID from Deployment Service (not nullable)
 *  railway_service_id→ VARCHAR, ID of the Railway service (nullable until deployed)
 *  runtime_url       → VARCHAR, public URL of the deployed app (nullable)
 *  status            → ENUM (deploying/running/restarting/stopping/stopped/failed/deleted)
 *  health            → ENUM (healthy/unhealthy/unknown)
 *  mode              → ENUM (monolith/microservices)
 *  restart_count     → INTEGER, default 0
 *  last_health_check → TIMESTAMP, nullable
 *  created_at        → TIMESTAMP, auto set on insert
 *  updated_at        → TIMESTAMP, auto updated on every write
 *
 * Indexes:
 *  - deployment_id   → For fast lookup by deployment
 *  - status          → For Reconciler queries (WHERE status = 'deploying')
 *
 * This schema file is used by Drizzle to generate migrations
 * and provide type-safe query builders.
 */
