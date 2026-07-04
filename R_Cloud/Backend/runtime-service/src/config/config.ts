import { config as dotenvConfig } from 'dotenv'
import { z } from 'zod'

dotenvConfig()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  GRPC_PORT: z.string().regex(/^\d+$/).default("50051").transform(Number),

  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

  RAILWAY_API_TOKEN: z.string().min(1, 'RAILWAY_API_TOKEN is required'),
  RAILWAY_API_URL: z.string().url().default('https://backboard.railway.com/graphql/v2'),

  NATS_URL: z.string().url('NATS_URL must be a valid URL (e.g., nats://localhost:4222)'),

  HEALTH_CHECK_INTERVAL_MS: z.string().regex(/^\d+$/).default("30000").transform(Number),
  HEALTH_CHECK_TIMEOUT_MS: z.string().regex(/^\d+$/).default("5000").transform(Number),
  MAX_RESTART_ATTEMPTS: z.string().regex(/^\d+$/).default("3").transform(Number),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  OTEL_SERVICE_NAME: z.string().default('runtime-service'),
  
  OTEL_COLLECTOR_ENDPOINT: z.string().url().optional(),
  OTEL_COLLECTOR_AUTH_HEADER: z.string().optional(),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('Environment validation failed:')
  parsedEnv.error.issues.forEach((issue) => {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`)
  })
  process.exit(1)
}

export const config = parsedEnv.data 

 