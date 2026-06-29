/**
 * src/grpc/server.ts
 *
 * gRPC SERVER — Bootstraps and starts the gRPC server.
 *
 * Responsibilities:
 *  - Create a new gRPC Server instance
 *  - Load the runtime.proto definition
 *  - Register all handlers (CreateRuntime, RestartRuntime, etc.)
 *  - Register all interceptors (auth, logger, error) in the correct order
 *  - Bind the server to the configured port (default: 50051)
 *  - Export a start() and stop() function for clean lifecycle management
 *
 * Interceptor Order (runs top to bottom on every incoming call):
 *  1. logger.interceptor   → Log the incoming call
 *  2. auth.interceptor     → Validate the caller is an authorized internal service
 *  3. error.interceptor    → Catch any unhandled errors and return proper gRPC status
 *  4. Handler              → Your actual business logic
 *
 * Port: Configurable via GRPC_PORT env var (default: 50051)
 *
 * Note: This server is NOT HTTP. It uses TCP with Protobuf binary protocol.
 * Do not confuse with the HTTP health server in index.ts.
 */
