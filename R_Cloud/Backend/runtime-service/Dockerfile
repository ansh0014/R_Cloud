FROM node:20-alpine AS builder

WORKDIR /app

COPY Backend/runtime-service/package*.json ./
RUN npm ci

COPY Backend/runtime-service/ .
RUN npm run build || true

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY Backend/runtime-service/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules

# Copy proto file — runtime-service loads it dynamically at /proto/runtime.proto
COPY proto/ /proto/

EXPOSE 8084 50051

CMD ["npx", "tsx", "src/index.ts"]
