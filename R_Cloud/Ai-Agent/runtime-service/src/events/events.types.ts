/**
 * src/events/events.types.ts
 *
 * EVENT TYPES — TypeScript interfaces for all NATS event payloads.
 *
 * Responsibilities:
 *  - Define the exact shape of every event this service publishes or consumes
 *  - Ensure type safety when constructing event payloads in event-publisher.ts
 *
 * Event Payload Interfaces:
 *
 *  RuntimeStartedEvent:
 *    { runtimeId, deploymentId, runtimeUrl, provider, timestamp }
 *
 *  RuntimeStoppedEvent:
 *    { runtimeId, deploymentId, timestamp }
 *
 *  RuntimeRestartedEvent:
 *    { runtimeId, deploymentId, restartCount, reason, timestamp }
 *
 *  RuntimeFailedEvent:
 *    { runtimeId, deploymentId, reason, timestamp }
 *
 *  RuntimePermanentlyFailedEvent:
 *    { runtimeId, deploymentId, restartCount, timestamp }
 *
 *  RuntimeDeletedEvent:
 *    { runtimeId, deploymentId, timestamp }
 *
 *  HealthCheckPassedEvent:
 *    { runtimeId, runtimeUrl, latencyMs, timestamp }
 *
 *  HealthCheckFailedEvent:
 *    { runtimeId, runtimeUrl, reason, timestamp }
 */
