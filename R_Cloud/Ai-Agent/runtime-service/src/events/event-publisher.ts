/**
 * src/events/event-publisher.ts
 *
 * EVENT PUBLISHER — Publishes lifecycle events to the NATS event bus.
 *
 * What is NATS?
 *  NATS is a lightweight message bus. When your service publishes an event,
 *  any other service that has subscribed to that event receives it automatically.
 *  Think of it as a group chat — you post a message, everyone in the room sees it.
 *
 * Why events?
 *  When a runtime starts, fails, or restarts, other services need to know.
 *  Instead of calling them directly (tight coupling), you publish an event
 *  and they subscribe. Your service doesn't know or care who is listening.
 *
 * Events Published by the Runtime Service:
 *  - "runtime.started"            → Runtime successfully deployed and healthy
 *  - "runtime.stopped"            → Runtime manually stopped
 *  - "runtime.restarted"          → Runtime was restarted (manual or auto)
 *  - "runtime.failed"             → Runtime deployment or health check failed
 *  - "runtime.permanently_failed" → Exceeded max restart attempts
 *  - "runtime.deleted"            → Runtime permanently removed from Railway
 *  - "health.check.passed"        → Periodic health check returned healthy
 *  - "health.check.failed"        → Periodic health check returned unhealthy
 *
 * Each event payload includes:
 *  - runtimeId, deploymentId, timestamp, and relevant status details
 *  See events.types.ts for exact payload shapes.
 */
