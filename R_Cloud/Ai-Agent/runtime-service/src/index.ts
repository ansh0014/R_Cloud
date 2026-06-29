/**
 * src/index.ts
 *
 * BOOTSTRAP — Entry point of the Runtime Service.
 *
 * Responsibilities:
 *  1. Load and validate all environment variables (config)
 *  2. Initialize OpenTelemetry tracer (must be first, before any imports)
 *  3. Connect to PostgreSQL database
 *  4. Connect to NATS event bus
 *  5. Run the Reconciler — fix any orphaned/stuck runtimes from previous crash
 *  6. Start the Health Scheduler — begin monitoring all active runtimes
 *  7. Start the gRPC server — begin accepting calls from other services
 *  8. Start the HTTP health server — so Railway can health-check this container
 *
 * Shutdown:
 *  - Listens for SIGTERM / SIGINT
 *  - Gracefully stops the gRPC server, health scheduler, and DB connections
 */
