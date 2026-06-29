/**
 * src/events/event-subscriber.ts
 *
 * EVENT SUBSCRIBER — Listens for relevant events from other services via NATS.
 *
 * Which events does the Runtime Service listen for?
 *  Currently minimal — the Runtime Service is mostly a publisher, not a consumer.
 *  But it may need to listen for:
 *
 *  - "deployment.cancelled" (from Deployment Service)
 *    → Immediately stop/cancel any in-progress provisioning
 *
 * Responsibilities:
 *  - Connect to NATS on service startup
 *  - Subscribe to relevant event subjects
 *  - Route incoming events to the appropriate handler function
 *
 * Note: Keep subscribers minimal. If the Runtime Service starts
 *       consuming too many events from other services, it becomes
 *       tightly coupled. Prefer gRPC calls for synchronous needs
 *       and events only for fire-and-forget notifications.
 */
