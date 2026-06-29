/**
 * src/telemetry/metrics.ts
 *
 * OPENTELEMETRY METRICS — Custom metrics exported to the collector.
 *
 * Why custom metrics?
 *  Auto-instrumentation captures HTTP/gRPC latency automatically.
 *  But domain-specific metrics (e.g. "how many runtimes are currently RUNNING?")
 *  must be defined manually. These appear in the AgentOps dashboard.
 *
 * Custom Metrics defined here:
 *
 *  runtime_deployments_total (Counter):
 *    → Increments every time a new runtime is successfully deployed
 *    → Labels: { mode: "monolith" | "microservices" }
 *
 *  runtime_health_checks_total (Counter):
 *    → Increments on every health check
 *    → Labels: { result: "healthy" | "unhealthy" }
 *
 *  runtime_restarts_total (Counter):
 *    → Increments every time a runtime is auto-restarted
 *    → Labels: { reason: "health_failure" | "manual" }
 *
 *  active_runtimes (Gauge):
 *    → Current count of RUNNING runtimes at any point in time
 *    → Updated whenever a runtime starts or stops
 *
 *  health_check_duration_ms (Histogram):
 *    → Distribution of /health endpoint response times across all runtimes
 */
