
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { config } from '../config/config.js'

// Only export to OTLP collector if the endpoint is configured.
// In development without a collector running, traces are just dropped silently.
const traceExporter = config.OTEL_EXPORTER_OTLP_ENDPOINT
  ? new OTLPTraceExporter({
      url: `${config.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
      headers: config.OTEL_COLLECTOR_AUTH_HEADER
        ? { Authorization: config.OTEL_COLLECTOR_AUTH_HEADER }
        : {},
    })
  : undefined

const sdk = new NodeSDK({
  // Identify this service in every trace
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: config.OTEL_SERVICE_NAME,
    'service.version': '1.0.0',
  }),

  // Auto-instrument: grpc-js, http, pg, fetch — no manual span code needed
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable noisy fs instrumentation (file reads create too many spans)
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],

  ...(traceExporter ? { traceExporter } : {}),
})

sdk.start()

// Graceful shutdown — flush all pending spans before the process exits
process.on('SIGTERM', () => {
  sdk.shutdown().then(
    () => console.log('OpenTelemetry SDK shut down successfully'),
    (err) => console.error('Error shutting down OpenTelemetry SDK', err),
  )
})

export { sdk }
