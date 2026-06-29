/**
 * src/grpc/interceptors/auth.interceptor.ts
 *
 * INTERCEPTOR — Authentication & Authorization.
 *
 * What is an interceptor?
 *  An interceptor is middleware for gRPC. It runs before every handler
 *  automatically. You register it once on the server and it applies to
 *  all incoming calls without touching individual handlers.
 *
 * Responsibilities:
 *  - Extract the service token from gRPC metadata (like a header in HTTP)
 *  - Validate the token is a known internal service token
 *  - Reject the call with gRPC UNAUTHENTICATED status if token is missing or invalid
 *  - Pass the call through to the next interceptor/handler if valid
 *
 * Why:
 *  The Runtime Service should only accept calls from authorized internal services
 *  (e.g. Deployment Service, AgentOps Service). It should never be publicly
 *  accessible. This interceptor enforces that boundary.
 *
 * Token Flow:
 *  Deployment Service → attaches "x-service-token: <secret>" in gRPC metadata
 *  → auth.interceptor validates it → handler runs
 */
