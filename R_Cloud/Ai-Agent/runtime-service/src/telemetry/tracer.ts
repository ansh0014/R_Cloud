/**
 * src/telemetry/tracer.ts
 *
 * OPENTELEMETRY TRACER — Distributed tracing setup.
 *
 * What is OpenTelemetry?
 *  A standard for collecting traces, metrics, and logs across services.
 *  A "trace" is a record of one operation (e.g. CreateRuntime) that spans
 *  multiple services. Each step creates a "span". Together they form a trace.
 *
 * Why does the Runtime Service need this?
 *  When the Deployment Service calls CreateRuntime, and your service then calls
 *  Railway, the AgentOps dashboard needs to see the FULL chain:
 *
 *  Deployment Service → Runtime Service → Railway API
 *  [  span 1         ] [    span 2     ] [  span 3  ]
 *                       ↑ your service instruments this
 *
 * Responsibilities:
 *  - Initialize the OpenTelemetry SDK on service startup (MUST run before any imports)
 *  - Configure the OTLP exporter to send traces to the OpenTelemetry Collector
 *  - Auto-instrument:
 *      - HTTP client calls (health checks to runtimes)
 *      - gRPC server calls (all incoming gRPC methods)
 *      - PostgreSQL queries (via pg instrumentation)
 *  - Export a createSpan() helper for manual spans in business logic
 *
 * IMPORTANT: This file must be imported and initialized in index.ts
 * as the VERY FIRST thing, before any other imports.
 * OpenTelemetry needs to patch libraries before they are loaded.
 */
